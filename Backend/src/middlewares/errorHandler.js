const AppError = require('../errors/AppError');

function esErrorDuplicado(err) {
  return err && err.code === 11000;
}

function esErrorValidacion(err) {
  return err && err.name === 'ValidationError';
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let mensaje = 'Error interno del servidor';
  let codigo = 'ERROR_INTERNO';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    mensaje = err.message;
    codigo = err.codigo;
  } else if (esErrorDuplicado(err)) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    mensaje = `Ya existe un registro con ese ${campo}`;
    codigo = 'REGISTRO_DUPLICADO';
  } else if (esErrorValidacion(err)) {
    statusCode = 400;
    mensaje = Object.values(err.errors).map((e) => e.message).join(', ');
    codigo = 'VALIDACION_INVALIDA';
  }

  if (statusCode === 500) {
    console.error('[errorHandler]', err);
  }

  res.status(statusCode).json({ statusCode, mensaje, codigo });
}

module.exports = errorHandler;
