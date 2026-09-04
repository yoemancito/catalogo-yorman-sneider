const Redis = require('ioredis');
const env = require('./env');

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('error', (err) => {
  if (err.code !== 'ECONNREFUSED') {
    console.error(`[redis] Error de conexión: ${err.message}`);
  }
});

redis.connect().catch(() => {});

async function pingRedis() {
  try {
    const respuesta = await redis.ping();
    return respuesta === 'PONG' ? 'up' : 'down';
  } catch (err) {
    return 'down';
  }
}

module.exports = { redis, pingRedis };
