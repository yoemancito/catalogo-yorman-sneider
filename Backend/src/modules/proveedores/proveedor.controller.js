const proveedorService = require('./proveedor.service');

async function listar(req, res, next) {
  try {
    const { page, limit, activo } = req.query;
    const resultado = await proveedorService.listarProveedores({ page, limit, activo });
    return res.status(200).json(resultado);
  } catch (err) {
    return next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const proveedor = await proveedorService.buscarProveedor(req.params.id);
    return res.status(200).json(proveedor);
  } catch (err) {
    return next(err);
  }
}

async function crear(req, res, next) {
  try {
    const proveedor = await proveedorService.crearProveedor(req.body);
    return res.status(201).json(proveedor);
  } catch (err) {
    return next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const proveedor = await proveedorService.actualizarProveedor(req.params.id, req.body);
    return res.status(200).json(proveedor);
  } catch (err) {
    return next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await proveedorService.eliminarProveedor(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
