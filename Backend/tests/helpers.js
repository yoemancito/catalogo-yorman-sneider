const mongoose = require('mongoose');

async function conectarBD() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}

async function limpiarBD() {
  const colecciones = mongoose.connection.collections;
  for (const clave in colecciones) {
    await colecciones[clave].deleteMany({});
  }
}

async function desconectarBD() {
  await mongoose.disconnect();
}

module.exports = { conectarBD, limpiarBD, desconectarBD };
