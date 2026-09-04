const express = require('express');
const authController = require('./auth.controller');
const rateLimit = require('../../middlewares/rateLimit');

const router = express.Router();

const limiteLogin = rateLimit({
  ventanaMs: 60 * 1000,
  maxPeticiones: 20,
  mensaje: 'Demasiados intentos de login. Espera un momento.',
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un usuario (público)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@demo.com }
 *               password: { type: string, example: secreta123 }
 *               rol: { type: string, enum: [admin, user], description: opcional, default user }
 *     responses:
 *       201: { description: Usuario creado (sin password) }
 *       409: { description: Email ya registrado }
 *       400: { description: Validación inválida }
 */
router.post('/register', authController.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión (público, rate limit estricto)
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@demo.com }
 *               password: { type: string, example: secreta123 }
 *     responses:
 *       200: { description: Token JWT }
 *       401: { description: Credenciales inválidas }
 *       429: { description: Demasiados intentos }
 */
router.post('/login', limiteLogin, authController.loguear);

module.exports = router;
