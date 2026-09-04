const importService = require('./import.service');
const importRepository = require('./import.repository');
const AppError = require('../../errors/AppError');

async function subir(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError(400, 'Debes adjuntar un archivo (.xlsx o .csv)', 'ARCHIVO_REQUERIDO');
    }

    const { proveedorId } = req.body;
    if (!proveedorId) {
      throw new AppError(400, 'Debes indicar el proveedorId', 'PROVEEDOR_REQUERIDO');
    }

    const job = await importService.crearImportacion({
      usuarioId: req.usuario.id,
      proveedorId,
      archivo: req.file,
    });

    importService.procesarImportacion(job._id).catch((err) => {
      console.error('[import] Error procesando job:', err.message);
    });

    return res.status(202).json(job);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { page, limit, estado } = req.query;
    const resultado = await importRepository.listar({
      page,
      limit,
      usuarioId: req.usuario.id,
      estado,
    });
    return res.status(200).json(resultado);
  } catch (err) {
    return next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const job = await importRepository.buscarPorId(req.params.id);
    if (!job) {
      throw new AppError(404, 'Job no encontrado', 'JOB_NO_ENCONTRADO');
    }
    return res.status(200).json(job);
  } catch (err) {
    return next(err);
  }
}

module.exports = { subir, listar, obtener };
