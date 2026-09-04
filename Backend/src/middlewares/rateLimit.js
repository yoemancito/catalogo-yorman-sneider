const AppError = require('../errors/AppError');

function rateLimit({ ventanaMs, maxPeticiones, mensaje }) {
  const registros = new Map();

  return function limitador(req, res, next) {
    const clave = req.ip;
    const ahora = Date.now();
    const registro = registros.get(clave) || [];

    const vigentes = registro.filter((ts) => ahora - ts < ventanaMs);

    if (vigentes.length >= maxPeticiones) {
      return next(new AppError(429, mensaje, 'DEMASIADAS_PETICIONES'));
    }

    vigentes.push(ahora);
    registros.set(clave, vigentes);
    return next();
  };
}

module.exports = rateLimit;
