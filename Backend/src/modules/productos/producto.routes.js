const express = require('express');
const productoController = require('./producto.controller');
const auth = require('../../middlewares/auth');
const rol = require('../../middlewares/rol');

const router = express.Router();

/**
 * @swagger
 * /productos:
 *   get:
 *     tags: [Productos]
 *     summary: Listar productos (autenticado, cualquier rol) - filtros combinables
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: categoria, schema: { type: string }, description: filtro por categoría }
 *       - { in: query, name: proveedor, schema: { type: string }, description: slug o id de proveedor }
 *       - { in: query, name: disponible, schema: { type: boolean }, description: true/false }
 *     responses:
 *       200: { description: 'Lista paginada: data, page, limit y total' }
 *       401: { description: No autenticado }
 *   post:
 *     tags: [Productos]
 *     summary: Crear producto (solo admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sku, nombre, precio, stock, categoria, proveedorId]
 *             properties:
 *               sku: { type: string }
 *               nombre: { type: string }
 *               precio: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               categoria: { type: string }
 *               proveedorId: { type: string }
 *               descripcion: { type: string, nullable: true }
 *               imagenUrl: { type: string, nullable: true }
 *     responses:
 *       201: { description: Producto creado }
 *       400: { description: Validación inválida }
 *       403: { description: Sin permisos de admin }
 *       404: { description: Proveedor no existe }
 *       409: { description: Sku duplicado }
 */
router.get('/', auth, productoController.listar);
router.post('/', auth, rol('admin'), productoController.crear);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener producto por id (autenticado)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Producto }
 *       404: { description: Producto no encontrado }
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar producto (solo admin)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku: { type: string }
 *               nombre: { type: string }
 *               precio: { type: number }
 *               stock: { type: integer }
 *               categoria: { type: string }
 *               proveedorId: { type: string }
 *               descripcion: { type: string, nullable: true }
 *               imagenUrl: { type: string, nullable: true }
 *     responses:
 *       200: { description: Producto actualizado }
 *       403: { description: Sin permisos de admin }
 *       404: { description: Producto no encontrado }
 *       409: { description: Sku duplicado }
 *   delete:
 *     tags: [Productos]
 *     summary: Eliminar producto (solo admin)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Eliminado (sin body) }
 *       403: { description: Sin permisos de admin }
 *       404: { description: Producto no encontrado }
 */
router.get('/:id', auth, productoController.obtener);
router.put('/:id', auth, rol('admin'), productoController.actualizar);
router.delete('/:id', auth, rol('admin'), productoController.eliminar);

module.exports = router;
