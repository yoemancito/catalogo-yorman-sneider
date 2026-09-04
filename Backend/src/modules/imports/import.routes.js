const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const importController = require('./import.controller');
const auth = require('../../middlewares/auth');
const rol = require('../../middlewares/rol');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `import-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const permitidos = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (permitidos.includes(ext)) return cb(null, true);
    cb(new Error('Solo se permiten archivos .xlsx, .xls o .csv'));
  },
});

router.post('/', auth, rol('admin'), upload.single('archivo'), importController.subir);
router.get('/', auth, rol('admin'), importController.listar);
router.get('/:id', auth, rol('admin'), importController.obtener);

module.exports = router;
