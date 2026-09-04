const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { pingRedis } = require('./config/redis');
const { getMongoStatus } = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const origenesPermitidos = (process.env.CORS_ORIGIN || 'http://localhost:5174')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(express.json());

app.use((req, res, next) => {
  const origen = req.headers.origin;
  const permitido =
    (origen && origenesPermitidos.includes(origen)) ||
    (origen && origen.endsWith('.vercel.app'));
  if (origen && permitido) {
    res.header('Access-Control-Allow-Origin', origen);
  }
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-token');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/health', async (req, res) => {
  const [mongo, redis] = await Promise.all([getMongoStatus(), pingRedis()]);
  if (mongo === 'up' && redis === 'up') {
    return res.status(200).json({ status: 'ok', mongo, redis });
  }
  return res.status(503).json({ status: 'error', mongo, redis });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require('./modules/auth/auth.routes');
const productoRoutes = require('./modules/productos/producto.routes');
const proveedorRoutes = require('./modules/proveedores/proveedor.routes');
const categoriaRoutes = require('./modules/categorias/categoria.routes');
const usuarioRoutes = require('./modules/usuarios/usuario.routes');
const importRoutes = require('./modules/imports/import.routes');

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/imports', importRoutes);

const Producto = require('./modules/productos/producto.model');

app.get('/api/catalogo', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, categoria } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
    const filtro = { disponible: true };
    if (categoria) filtro.categoria = String(categoria).toLowerCase();
    const [total, data] = await Promise.all([
      Producto.countDocuments(filtro),
      Producto.find(filtro).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    ]);
    return res.status(200).json({ data, page: pageNum, limit: limitNum, total });
  } catch (err) {
    return next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({
    statusCode: 404,
    mensaje: 'Ruta no encontrada',
    codigo: 'RUTA_NO_ENCONTRADA',
  });
});

app.use(errorHandler);

module.exports = app;
