const usuarioService = require('./usuario.service');

async function listar(req, res, next) {
  try {
    const { page, limit, rol, busqueda } = req.query;
    const resultado = await usuarioService.listar({ page, limit, rol, busqueda });
    return res.status(200).json(resultado);
  } catch (err) {
    return next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const usuario = await usuarioService.buscarPorId(req.params.id);
    return res.status(200).json(usuario);
  } catch (err) {
    return next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const usuario = await usuarioService.actualizar(req.params.id, req.body);
    return res.status(200).json(usuario);
  } catch (err) {
    return next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await usuarioService.eliminar(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listar, obtener, actualizar, eliminar };
