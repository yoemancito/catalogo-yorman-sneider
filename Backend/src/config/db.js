const mongoose = require('mongoose');
const env = require('./env');

const MAX_REINTENTOS = 10;
const ESPERA_MS = 3000;

async function connectDB() {
  let intento = 0;
  while (true) {
    intento += 1;
    try {
      await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('[db] Conexión a MongoDB establecida');
      return;
    } catch (err) {
      if (intento >= MAX_REINTENTOS) {
        console.error(`[db] No se pudo conectar a MongoDB tras ${MAX_REINTENTOS} intentos: ${err.message}`);
        process.exit(1);
      }
      console.warn(`[db] Intento ${intento}/${MAX_REINTENTOS} fallido (${err.message}). Reintentando en ${ESPERA_MS}ms...`);
      await new Promise((resolver) => setTimeout(resolver, ESPERA_MS));
    }
  }
}

function getMongoStatus() {
  return mongoose.connection.readyState === 1 ? 'up' : 'down';
}

module.exports = { connectDB, getMongoStatus };
