const AppError = require('../../errors/AppError');
const mongoose = require('mongoose');
const Proveedor = require('../proveedores/proveedor.model');
const productoRepository = require('./producto.repository');

function normalizarProducto(datos) {
  const limpio = {};

  if (datos.sku !== undefined) {
    limpio.sku = String(datos.sku).trim().toUpperCase();
  }
  if (datos.nombre !== undefined) {
    limpio.nombre = String(datos.nombre).trim().replace(/\s+/g, ' ');
  }
  if (datos.precio !== undefined) {
    limpio.precio = Math.round(Number(datos.precio) * 100) / 100;
  }
  if (datos.stock !== undefined) {
    limpio.stock = Math.trunc(Number(datos.stock));
  }
  if (datos.categoria !== undefined) {
    limpio.categoria = String(datos.categoria).trim().toLowerCase();
  }
  if (datos.descripcion !== undefined) {
    const d = String(datos.descripcion).trim();
    limpio.descripcion = d === '' ? null : d;
  }
  if (datos.imagenUrl !== undefined) {
    const u = String(datos.imagenUrl).trim();
    limpio.imagenUrl = u === '' || !/^https?:\/\/.+/.test(u) ? null : u;
  }
  if (datos.proveedorId !== undefined) {
    limpio.proveedorId = datos.proveedorId;
  }

  return limpio;
}

async function resolverProveedor(proveedor) {
  let proveedorDoc = null;
  if (mongoose.Types.ObjectId.isValid(proveedor)) {
    proveedorDoc = await Proveedor.findById(proveedor);
  } else {
    proveedorDoc = await Proveedor.findOne({ slug: proveedor });
  }
  if (!proveedorDoc) {
    throw new AppError(404, 'El proveedor indicado no existe', 'PROVEEDOR_NO_EXISTE');
  }
  return proveedorDoc._id;
}

async function listarProductos({ page, limit, categoria, proveedor, disponible }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const filtro = {};
  if (categoria) filtro.categoria = String(categoria).toLowerCase();
  if (disponible !== undefined) filtro.disponible = disponible === 'true';
  if (proveedor) filtro.proveedorId = await resolverProveedor(proveedor);

  return productoRepository.listar({ page: pageNum, limit: limitNum, filtro });
}

async function crearProducto(datos) {
  const limpio = normalizarProducto(datos);
  limpio.proveedorId = await resolverProveedor(datos.proveedorId);

  const duplicado = await productoRepository.buscarPorSku(limpio.sku);
  if (duplicado) {
    throw new AppError(409, 'El sku ya existe', 'SKU_DUPLICADO');
  }

  return productoRepository.crear(limpio);
}

async function buscarProducto(id) {
  const producto = await productoRepository.buscarPorId(id);
  if (!producto) {
    throw new AppError(404, 'Producto no encontrado', 'PRODUCTO_NO_ENCONTRADO');
  }
  return producto;
}

async function actualizarProducto(id, datos) {
  await buscarProducto(id);

  const limpio = normalizarProducto(datos);

  if (limpio.sku !== undefined) {
    const duplicado = await productoRepository.buscarPorSku(limpio.sku);
    if (duplicado && duplicado._id.toString() !== id) {
      throw new AppError(409, 'El sku ya existe', 'SKU_DUPLICADO');
    }
  }
  if (limpio.proveedorId !== undefined) {
    limpio.proveedorId = await resolverProveedor(datos.proveedorId);
  }

  return productoRepository.actualizar(id, limpio);
}

async function eliminarProducto(id) {
  const eliminado = await productoRepository.eliminar(id);
  if (!eliminado) {
    throw new AppError(404, 'Producto no encontrado', 'PRODUCTO_NO_ENCONTRADO');
  }
}

module.exports = {
  listarProductos,
  crearProducto,
  buscarProducto,
  actualizarProducto,
  eliminarProducto,
};
