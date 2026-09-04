const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const env = require('../config/env');
const Usuario = require('../modules/auth/usuario.model');

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, bearerToken] = header.split(' ');

  const token = req.headers['x-token'] || (tipo === 'Bearer' ? bearerToken : null);

  if (!token) {
    return next(new AppError(401, 'Token no proporcionado', 'TOKEN_REQUERIDO'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.usuario = { id: payload.sub || payload.uid, rol: payload.rol };
  } catch (err) {
    return next(new AppError(401, 'Token inválido o expirado', 'TOKEN_INVALIDO'));
  }

  try {
    const usuario = await Usuario.findById(req.usuario.id).select('activo').lean();
    if (!usuario || usuario.activo === false) {
      return next(new AppError(403, 'Usuario desactivado', 'USUARIO_DESACTIVADO'));
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = auth;