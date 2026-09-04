const express = require('express');
const usuarioController = require('./usuario.controller');
const auth = require('../../middlewares/auth');
const rol = require('../../middlewares/rol');

const router = express.Router();

router.get('/', auth, rol('admin'), usuarioController.listar);
router.get('/:id', auth, rol('admin'), usuarioController.obtener);
router.put('/:id', auth, rol('admin'), usuarioController.actualizar);
router.delete('/:id', auth, rol('admin'), usuarioController.eliminar);

module.exports = router;
