const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../errors/AppError');
const env = require('../../config/env');
const Usuario = require('./usuario.model');

const SALT_ROUNDS = 10;

async function registrar({ email, password, rol }) {
  const yaExiste = await Usuario.findOne({ email: email.toLowerCase() });
  if (yaExiste) {
    throw new AppError(409, 'El email ya está registrado', 'EMAIL_YA_REGISTRADO');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await Usuario.create({ email, password: hash, rol: rol || 'user' });

  return { id: usuario._id, email: usuario.email, rol: usuario.rol };
}

async function loguear({ email, password }) {
  const usuario = await Usuario.findOne({ email: email.toLowerCase() }).select('+password');
  if (!usuario) {
    throw new AppError(401, 'Credenciales inválidas', 'CREDENCIALES_INVALIDAS');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new AppError(401, 'Credenciales inválidas', 'CREDENCIALES_INVALIDAS');
  }

  const token = jwt.sign(
    { sub: usuario._id.toString(), rol: usuario.rol.toLowerCase() },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return { token };
}

module.exports = { registrar, loguear };
