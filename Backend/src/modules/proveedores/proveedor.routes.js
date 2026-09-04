const express = require('express');
const proveedorController = require('./proveedor.controller');
const auth = require('../../middlewares/auth');
const rol = require('../../middlewares/rol');

const router = express.Router();

/**
 * @swagger
 * /proveedores:
 *   get:
 *     tags: [Proveedores]
 *     summary: Listar proveedores (autenticado)
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 } }
 *       - { in: query, name: activo, schema: { type: boolean }, description: filtrar por activo }
 *     responses:
 *       200: { description: Lista paginada }
 *   post:
 *     tags: [Proveedores]
 *     summary: Crear proveedor (solo admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre]
 *             properties:
 *               nombre: { type: string }
 *               slug: { type: string, description: opcional, se genera del nombre }
 *               contactoEmail: { type: string, nullable: true }
 *               logoUrl: { type: string, nullable: true }
 *     responses:
 *       201: { description: Proveedor creado }
 *       403: { description: Sin permisos de admin }
 *       409: { description: Nombre o slug duplicado }
 */
router.get('/', auth, proveedorController.listar);
router.post('/', auth, rol('admin'), proveedorController.crear);

/**
 * @swagger
 * /proveedores/{id}:
 *   get:
 *     tags: [Proveedores]
 *     summary: Obtener proveedor (autenticado)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Proveedor }
 *       404: { description: Proveedor no encontrado }
 *   put:
 *     tags: [Proveedores]
 *     summary: 'Actualizar proveedor (solo admin) - permite activo: false'
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
 *               slug: { type: string }
 *               contactoEmail: { type: string, nullable: true }
 *               logoUrl: { type: string, nullable: true }
 *               activo: { type: boolean }
 *     responses:
 *       200: { description: Proveedor actualizado }
 *       403: { description: Sin permisos de admin }
 *       404: { description: Proveedor no encontrado }
 *   delete:
 *     tags: [Proveedores]
 *     summary: Eliminar proveedor (solo admin) - 409 si tiene productos
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Eliminado (sin body) }
 *       403: { description: Sin permisos de admin }
 *       404: { description: Proveedor no encontrado }
 *       409: { description: Tiene productos asociados }
 */
router.get('/:id', auth, proveedorController.obtener);
router.put('/:id', auth, rol('admin'), proveedorController.actualizar);
router.delete('/:id', auth, rol('admin'), proveedorController.eliminar);

module.exports = router;
