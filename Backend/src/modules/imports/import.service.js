const XLSX = require('xlsx');
const fs = require('fs');
const AppError = require('../../errors/AppError');
const Producto = require('../productos/producto.model');
const Proveedor = require('../proveedores/proveedor.model');
const Categoria = require('../categorias/categoria.model');
const importRepository = require('./import.repository');
const env = require('../../config/env');

function parsearArchivo(ruta) {
  const workbook = XLSX.readFile(ruta);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new AppError(400, 'El archivo no tiene hojas de datos', 'ARCHIVO_VACIO');
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

function validarFila(fila) {
  const errores = [];
  if (!fila.sku || String(fila.sku).trim() === '') errores.push('SKU vacio');
  if (!fila.nombre || String(fila.nombre).trim() === '') errores.push('Nombre vacio');
  if (fila.precio === undefined || fila.precio === null || Number(fila.precio) < 0) errores.push('Precio invalido');
  if (fila.stock === undefined || fila.stock === null || Number(fila.stock) < 0) errores.push('Stock invalido');
  return errores;
}

function normalizarProducto(fila, proveedorId) {
  const sku = String(fila.sku).trim().toUpperCase();
  return {
    sku,
    nombre: String(fila.nombre).trim(),
    precio: Math.round(Number(fila.precio) * 100) / 100,
    stock: Math.trunc(Number(fila.stock)),
    disponible: Math.trunc(Number(fila.stock)) > 0,
    categoria: String(fila.categoria || 'sin-categoria').trim().toLowerCase(),
    proveedorId,
    descripcion: fila.descripcion ? String(fila.descripcion).trim() : null,
    imagenUrl: fila.imagenUrl && /^https?:\/\/.+/.test(String(fila.imagenUrl).trim())
      ? String(fila.imagenUrl).trim()
      : null,
  };
}

async function procesarImportacion(jobId) {
  const job = await importRepository.buscarPorId(jobId);
  if (!job) throw new AppError(404, 'Job no encontrado', 'JOB_NO_ENCONTRADO');

  await importRepository.actualizar(jobId, {
    estado: 'processing',
    startedAt: new Date(),
  });

  try {
    const filas = parsearArchivo(job.archivoRuta);

    if (filas.length === 0) {
      await importRepository.actualizar(jobId, {
        estado: 'completed', total: 0, procesados: 0, exitosos: 0, fallidos: 0,
        finishedAt: new Date(),
      });
      fs.unlinkSync(job.archivoRuta);
      return;
    }

    const total = filas.length;
    let exitosos = 0;
    let fallidos = 0;
    const todosErrores = [];

    for (let i = 0; i < filas.length; i += env.BATCH_SIZE) {
      const lote = filas.slice(i, i + env.BATCH_SIZE);

      const validos = [];
      for (let j = 0; j < lote.length; j++) {
        const filaNum = i + j + 2;
        const fila = lote[j];
        const erroresFila = validarFila(fila);

        if (erroresFila.length > 0) {
          for (const motivo of erroresFila) {
            todosErrores.push({ fila: filaNum, sku: fila.sku || null, motivo });
          }
          fallidos++;
          continue;
        }

        validos.push({ filaNum, datos: normalizarProducto(fila, job.proveedorId) });
      }

      if (validos.length === 0) {
        await importRepository.actualizar(jobId, {
          procesados: Math.min(i + env.BATCH_SIZE, total),
          exitosos, fallidos,
          errores: todosErrores.slice(-env.IMPORT_ERRORS_CAP),
        });
        continue;
      }

      const skus = validos.map((v) => v.datos.sku);

      const existentes = await Producto.find({ sku: { $in: skus } }).select('sku').lean();
      const skusExistentes = new Set(existentes.map((e) => e.sku));

      const skusDentroLote = new Set();
      const paraInsertar = [];
      for (const v of validos) {
        if (skusExistentes.has(v.datos.sku)) {
          todosErrores.push({
            fila: v.filaNum,
            sku: v.datos.sku,
            motivo: 'SKU duplicado en catalogo existente',
          });
          fallidos++;
          continue;
        }
        if (skusDentroLote.has(v.datos.sku)) {
          todosErrores.push({
            fila: v.filaNum,
            sku: v.datos.sku,
            motivo: 'SKU duplicado dentro del mismo archivo',
          });
          fallidos++;
          continue;
        }
        skusDentroLote.add(v.datos.sku);
        paraInsertar.push(v.datos);
      }

      if (paraInsertar.length > 0) {
        try {
          await Producto.insertMany(paraInsertar, { ordered: false });
          exitosos += paraInsertar.length;
        } catch (err) {
          if (err.name === 'MongoBulkWriteError' && err.writeErrors) {
            const insertados = paraInsertar.length - err.writeErrors.length;
            exitosos += Math.max(0, insertados);
            for (const we of err.writeErrors) {
              const idx = we.index;
              todosErrores.push({
                fila: validos[idx]?.filaNum || i + idx + 2,
                sku: paraInsertar[idx]?.sku || null,
                motivo: we.errmsg || 'Error al insertar',
              });
              fallidos++;
            }
          } else {
            todosErrores.push({
              fila: i + 2,
              sku: null,
              motivo: err.message || 'Error bulk insert',
            });
            fallidos += paraInsertar.length;
          }
        }
      }

      const categoriasNuevas = [...new Set(paraInsertar.map((p) => p.categoria))];
      if (categoriasNuevas.length > 0) {
        const existentesCat = await Categoria.find({ slug: { $in: categoriasNuevas } }).select('slug').lean();
        const slugsExistentes = new Set(existentesCat.map((c) => c.slug));
        const paraCrear = categoriasNuevas
          .filter((s) => !slugsExistentes.has(s))
          .map((s) => ({ slug: s, nombre: s }));

        if (paraCrear.length > 0) {
          try {
            await Categoria.insertMany(paraCrear, { ordered: true });
          } catch (_) {}
        }
      }

      await importRepository.actualizar(jobId, {
        procesados: Math.min(i + env.BATCH_SIZE, total),
        exitosos, fallidos,
        errores: todosErrores.slice(-env.IMPORT_ERRORS_CAP),
      });
    }

    await importRepository.actualizar(jobId, {
      estado: 'completed', total, procesados: total, exitosos, fallidos,
      errores: todosErrores.slice(-env.IMPORT_ERRORS_CAP),
      finishedAt: new Date(),
    });
  } catch (err) {
    await importRepository.actualizar(jobId, {
      estado: 'failed',
      motivoFallo: err.message || 'Error desconocido',
      finishedAt: new Date(),
    });
  } finally {
    try {
      if (fs.existsSync(job.archivoRuta)) fs.unlinkSync(job.archivoRuta);
    } catch (_) {}
  }
}

async function crearImportacion({ usuarioId, proveedorId, archivo }) {
  const proveedor = await Proveedor.findById(proveedorId);
  if (!proveedor) throw new AppError(404, 'Proveedor no encontrado', 'PROVEEDOR_NO_EXISTE');

  return importRepository.crear({
    usuarioId,
    proveedorId,
    archivoNombre: archivo.originalname,
    archivoRuta: archivo.path,
    estado: 'pending',
  });
}

module.exports = { crearImportacion, procesarImportacion };
