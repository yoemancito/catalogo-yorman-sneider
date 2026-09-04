
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const REQUERIDAS_SIEMPRE = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'MAX_FILE_SIZE_MB',
  'BATCH_SIZE',
  'CACHE_TTL_SECONDS',
  'IMPORT_ERRORS_CAP',
];

const REQUERIDAS_SIN_REDIS_URL = ['REDIS_HOST', 'REDIS_PORT'];

const faltantes = REQUERIDAS_SIEMPRE.filter((nombre) => !process.env[nombre])
  .concat(process.env.REDIS_URL ? [] : REQUERIDAS_SIN_REDIS_URL.filter((nombre) => !process.env[nombre]));

if (faltantes.length > 0) {
  console.error(`[env] Faltan variables de entorno obligatorias: ${faltantes.join(', ')}`);
  console.error('[env] Cópialas de .env.example a .env o defínelas en el entorno.');
  process.exit(1);
}

const env = {
  PORT: Number(process.env.PORT),
  MONGO_URI: process.env.MONGO_URI,
  REDIS_URL: process.env.REDIS_URL,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB),
  BATCH_SIZE: Number(process.env.BATCH_SIZE),
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS),
  IMPORT_ERRORS_CAP: Number(process.env.IMPORT_ERRORS_CAP),
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};

module.exports = env;
