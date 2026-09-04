const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function iniciar() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`[server] API escuchando en http://localhost:${env.PORT}`);
  });
}

iniciar().catch((err) => {
  console.error('[server] Error fatal al arrancar:', err);
  process.exit(1);
});
