const express = require('express');
const categoriaController = require('./categoria.controller');
const auth = require('../../middlewares/auth');
const rol = require('../../middlewares/rol');

const router = express.Router();

/**
 * @swagger
 * /categorias:
 *   get:
 *     tags: [Categorias]
 *     summary: Listar categorías (autenticado) - sin paginar
 *     responses:
 *       200: { description: Lista de categorías con su metadata }
 */
router.get('/', auth, categoriaController.listar);

/**
 * @swagger
 * /categorias/{slug}:
 *   get:
 *     tags: [Categorias]
 *     summary: Obtener categoría por slug (autenticado)
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Categoría }
 *       404: { description: Categoría no encontrada }
 */
router.get('/:slug', auth, categoriaController.obtener);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     tags: [Categorias]
 *     summary: Enriquecer categoría (solo admin) - el slug no se edita
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string, nullable: true }
 *               imagenUrl: { type: string, nullable: true }
 *     responses:
 *       200: { description: Categoría actualizada }
 *       403: { description: Sin permisos de admin }
 *       404: { description: Categoría no encontrada }
 */
router.put('/:id', auth, rol('admin'), categoriaController.actualizar);

module.exports = router;
