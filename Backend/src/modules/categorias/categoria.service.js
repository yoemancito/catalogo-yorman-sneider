const AppError = require('../../errors/AppError');
const categoriaRepository = require('./categoria.repository');

async function listarCategorias() {
  return categoriaRepository.listar();
}

async function buscarCategoria(slug) {
  const categoria = await categoriaRepository.buscarPorSlug(String(slug).toLowerCase());
  if (!categoria) {
    throw new AppError(404, 'Categoría no encontrada', 'CATEGORIA_NO_ENCONTRADA');
  }
  return categoria;
}

async function actualizarCategoria(id, datos) {
  const categoria = await categoriaRepository.actualizar(id, datos);
  if (!categoria) {
    throw new AppError(404, 'Categoría no encontrada', 'CATEGORIA_NO_ENCONTRADA');
  }
  return categoria;
}

module.exports = { listarCategorias, buscarCategoria, actualizarCategoria };
