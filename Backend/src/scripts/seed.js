const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('../modules/auth/usuario.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/catalogobulk';
const SEED_EMAIL = 'admin@sena.edu.co';
const SEED_PASSWORD = '123456';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[seed] Conectado a MongoDB');

    const existente = await Usuario.findOne({ email: SEED_EMAIL });
    if (existente) {
      console.log(`[seed] El usuario ${SEED_EMAIL} ya existe. Nada que hacer.`);
      process.exit(0);
    }

    const hash = await bcrypt.hash(SEED_PASSWORD, 10);
    await Usuario.create({
      email: SEED_EMAIL,
      password: hash,
      rol: 'admin',
    });

    console.log(`[seed] Usuario creado: ${SEED_EMAIL} / ${SEED_PASSWORD}`);
    process.exit(0);
  } catch (err) {
    console.error('[seed] Error:', err.message);
    process.exit(1);
  }
}

seed();