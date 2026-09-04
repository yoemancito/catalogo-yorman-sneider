class AppError extends Error {
  constructor(statusCode, mensaje, codigo = 'ERROR_GENERICO') {
    super(mensaje);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.isOperational = true;
  }
}

module.exports = AppError;
