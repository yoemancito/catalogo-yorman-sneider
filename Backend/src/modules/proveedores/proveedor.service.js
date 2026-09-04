const AppError = require('../../errors/AppError');
const proveedorRepository = require('./proveedor.repository');
const productoRepository = require('../productos/producto.repository');

function generarSlug(nombre) {
  return String(nombre).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function listarProveedores({ page, limit, activo }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));

  const filtro = {};
  if (activo !== undefined) filtro.activo = activo === 'true';

  return proveedorRepository.listar({ page: pageNum, limit: limitNum, filtro });
}

async function crearProveedor(datos) {
  const datosFinales = { ...datos };
  if (!datosFinales.slug) {
    datosFinales.slug = generarSlug(datosFinales.nombre);
  }
  return proveedorRepository.crear(datosFinales);
}

async function buscarProveedor(id) {
  const proveedor = await proveedorRepository.buscarPorId(id);
  if (!proveedor) {
    throw new AppError(404, 'Proveedor no encontrado', 'PROVEEDOR_NO_ENCONTRADO');
  }
  return proveedor;
}

async function actualizarProveedor(id, datos) {
  await buscarProveedor(id);
  return proveedorRepository.actualizar(id, datos);
}

async function eliminarProveedor(id) {
  await buscarProveedor(id);

  const conProductos = (await productoRepository.contarPorProveedor(id)) > 0;
  if (conProductos) {
    throw new AppError(
      409,
      'No se puede eliminar: el proveedor tiene productos asociados. Desactívalo con activo: false',
      'PROVEEDOR_CON_PRODUCTOS'
    );
  }

  await proveedorRepository.eliminar(id);
}

module.exports = {
  listarProveedores,
  crearProveedor,
  buscarProveedor,
  actualizarProveedor,
  eliminarProveedor,
};
