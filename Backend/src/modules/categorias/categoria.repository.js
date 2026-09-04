const Categoria = require('./categoria.model');

async function listar() {
  return Categoria.find().sort({ slug: 1 });
}

async function buscarPorSlug(slug) {
  return Categoria.findOne({ slug });
}

async function actualizar(id, datos) {
  return Categoria.findByIdAndUpdate(id, datos, { returnDocument: 'after', runValidators: true });
}

module.exports = { listar, buscarPorSlug, actualizar };
