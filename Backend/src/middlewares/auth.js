const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');
const env = require('../config/env');

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, bearerToken] = header.split(' ');

  const token = req.headers['x-token'] || (tipo === 'Bearer' ? bearerToken : null);

  if (!token) {
    return next(new AppError(401, 'Token no proporcionado', 'TOKEN_REQUERIDO'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.usuario = { id: payload.sub || payload.uid, rol: payload.rol };
    return next();
  } catch (err) {
    return next(new AppError(401, 'Token inválido o expirado', 'TOKEN_INVALIDO'));
  }
}

module.exports = auth;
