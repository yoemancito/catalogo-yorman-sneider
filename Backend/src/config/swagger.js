const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CatálogoBulk API',
      version: '1.0.0',
      description:
        'Sistema de importación masiva de productos con procesamiento asíncrono. Auth + CRUD de productos, proveedores y categorías.',
    },
    servers: [{ url: 'http://localhost:3000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/modules/**/*.routes.js'],
};

module.exports = swaggerJsdoc(options);
