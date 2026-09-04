const Proveedor = require('./proveedor.model');

async function listar({ page, limit, filtro }) {
  const [total, docs] = await Promise.all([
    Proveedor.countDocuments(filtro),
    Proveedor.find(filtro).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: docs, page, limit, total };
}

async function buscarPorId(id) {
  return Proveedor.findById(id);
}

async function buscarPorSlug(slug) {
  return Proveedor.findOne({ slug });
}

async function crear(datos) {
  return Proveedor.create(datos);
}

async function actualizar(id, datos) {
  return Proveedor.findByIdAndUpdate(id, datos, { returnDocument: 'after', runValidators: true });
}

async function eliminar(id) {
  return Proveedor.findByIdAndDelete(id);
}

module.exports = { listar, buscarPorId, buscarPorSlug, crear, actualizar, eliminar };
