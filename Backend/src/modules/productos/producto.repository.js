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
  if (aActualizar.stock !== undefined || aActualizar.activo !== undefined) {
    const actual = await Producto.findById(id);
    const activo = aActualizar.activo !== undefined ? aActualizar.activo : actual?.activo;
    const stock = aActualizar.stock !== undefined ? aActualizar.stock : actual?.stock;
    aActualizar.disponible = activo !== false && Number(stock) > 0;
  }
  return Producto.findByIdAndUpdate(id, aActualizar, { returnDocument: 'after', runValidators: true });
}

async function desactivar(id) {
  return Producto.findByIdAndUpdate(id, { activo: false, disponible: false }, { returnDocument: 'after', runValidators: true });
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
  desactivar,
  contarPorProveedor,
};
