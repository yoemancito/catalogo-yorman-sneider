const Producto = require('./producto.model');

async function listar({ page, limit, filtro }) {
  const [total, docs] = await Promise.all([
    Producto.countDocuments(filtro),
    Producto.find(filtro).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  return { data: docs, page, limit, total };
}

async function buscarPorId(id) {
  return Producto.findById(id);
}

async function buscarPorSku(sku) {
  return Producto.findOne({ sku });
}

async function crear(datos) {
  return Producto.create(datos);
}

async function actualizar(id, datos) {
  const aActualizar = { ...datos };
  if (aActualizar.stock !== undefined) {
    aActualizar.disponible = aActualizar.stock > 0;
  }
  return Producto.findByIdAndUpdate(id, aActualizar, { returnDocument: 'after', runValidators: true });
}

async function eliminar(id) {
  return Producto.findByIdAndDelete(id);
}

async function contarPorProveedor(proveedorId) {
  return Producto.countDocuments({ proveedorId });
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorSku,
  crear,
  actualizar,
  eliminar,
  contarPorProveedor,
};
