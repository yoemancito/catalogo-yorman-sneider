const AppError = require('../errors/AppError');

function rol(rolRequerido) {
  return function requireRol(req, res, next) {
    if (!req.usuario) {
      return next(new AppError(401, 'Debes autenticarte primero', 'NO_AUTENTICADO'));
    }
    if (req.usuario.rol.toLowerCase() !== rolRequerido.toLowerCase()) {
      return next(
        new AppError(403, 'No tienes permisos para esta acción', 'ROL_NO_PERMITIDO')
      );
    }
    return next();
  };
}

module.exports = rol;
