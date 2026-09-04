const categoriaService = require('./categoria.service');

async function listar(req, res, next) {
  try {
    const categorias = await categoriaService.listarCategorias();
    return res.status(200).json(categorias);
  } catch (err) {
    return next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const categoria = await categoriaService.buscarCategoria(req.params.slug);
    return res.status(200).json(categoria);
  } catch (err) {
    return next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const categoria = await categoriaService.actualizarCategoria(req.params.id, req.body);
    return res.status(200).json(categoria);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, obtener, actualizar };
