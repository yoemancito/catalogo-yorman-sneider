const ImportJob = require('./importJob.model');

async function crear(datos) {
  return ImportJob.create(datos);
}

async function buscarPorId(id) {
  return ImportJob.findById(id);
}

async function listar({ page, limit, usuarioId, estado }) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const filtro = {};
  if (usuarioId) filtro.usuarioId = usuarioId;
  if (estado) filtro.estado = estado;

  const [total, docs] = await Promise.all([
    ImportJob.countDocuments(filtro),
    ImportJob.find(filtro)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
  ]);

  return { data: docs, page: pageNum, limit: limitNum, total };
}

async function actualizar(id, campos) {
  return ImportJob.findByIdAndUpdate(id, campos, { returnDocument: 'after' });
}

module.exports = { crear, buscarPorId, listar, actualizar };
