const productoService = require('./producto.service');

async function listar(req, res, next) {
  try {
    const { page, limit, categoria, proveedor, disponible } = req.query;
    const resultado = await productoService.listarProductos({
      page,
      limit,
      categoria,
      proveedor,
      disponible,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    return next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const producto = await productoService.buscarProducto(req.params.id);
    return res.status(200).json(producto);
  } catch (err) {
    return next(err);
  }
}

async function crear(req, res, next) {
  try {
    const producto = await productoService.crearProducto(req.body);
    return res.status(201).json(producto);
  } catch (err) {
    return next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const producto = await productoService.actualizarProducto(req.params.id, req.body);
    return res.status(200).json(producto);
  } catch (err) {
    return next(err);
  }
}

async function desactivar(req, res, next) {
  try {
    const producto = await productoService.desactivarProducto(req.params.id);
    return res.status(200).json(producto);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, desactivar };
