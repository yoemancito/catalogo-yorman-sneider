const request = require('supertest');
const app = require('../src/app');
const { conectarBD, limpiarBD, desconectarBD } = require('./helpers');

beforeAll(conectarBD);
afterAll(desconectarBD);
beforeEach(limpiarBD);

async function tokenDe(rol) {
  const email = `${rol}${Date.now()}@test.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'secreta123', rol });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'secreta123' });
  return res.body.token;
}

async function adminConProveedor() {
  const tokenAdmin = await tokenDe('admin');
  const res = await request(app)
    .post('/api/proveedores')
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send({ nombre: 'Acme Corp' });
  return { tokenAdmin, proveedorId: res.body._id };
}

describe('Productos', () => {
  it('user recibe 403 en POST /productos', async () => {
    const tokenUser = await tokenDe('user');
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ sku: 'X1', nombre: 'X', precio: 1, stock: 1, categoria: 'x', proveedorId: '000000000000000000000000' });

    expect(res.status).toBe(403);
  });

  it('admin crea un producto: 201 y disponible derivado de stock', async () => {
    const { tokenAdmin, proveedorId } = await adminConProveedor();
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ sku: 'SKU-001', nombre: 'Camiseta', precio: 29.99, stock: 5, categoria: 'Ropa', proveedorId });

    expect(res.status).toBe(201);
    expect(res.body.sku).toBe('SKU-001');
    expect(res.body.categoria).toBe('ropa');
    expect(res.body.disponible).toBe(true);
  });

  it('sku duplicado devuelve 409 (no un 500)', async () => {
    const { tokenAdmin, proveedorId } = await adminConProveedor();
    const body = { sku: 'SKU-001', nombre: 'A', precio: 10, stock: 1, categoria: 'ropa', proveedorId };

    await request(app).post('/api/productos').set('Authorization', `Bearer ${tokenAdmin}`).send(body);
    const res = await request(app).post('/api/productos').set('Authorization', `Bearer ${tokenAdmin}`).send(body);

    expect(res.status).toBe(409);
    expect(res.body.codigo).toBe('SKU_DUPLICADO');
  });

  it('proveedor inexistente devuelve 404', async () => {
    const tokenAdmin = await tokenDe('admin');
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ sku: 'SKU-002', nombre: 'A', precio: 10, stock: 1, categoria: 'ropa', proveedorId: '000000000000000000000000' });

    expect(res.status).toBe(404);
  });

  it('actualizar stock a 0 recalcula disponible en false', async () => {
    const { tokenAdmin, proveedorId } = await adminConProveedor();
    const creado = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ sku: 'SKU-003', nombre: 'A', precio: 10, stock: 5, categoria: 'ropa', proveedorId });

    const res = await request(app)
      .put(`/api/productos/${creado.body._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ stock: 0 });

    expect(res.status).toBe(200);
    expect(res.body.disponible).toBe(false);
  });

  it('lista paginada con filtro de categoria', async () => {
    const { tokenAdmin, proveedorId } = await adminConProveedor();
    const token = await tokenDe('user');
    const crear = (sku, categoria) =>
      request(app).post('/api/productos').set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ sku, nombre: 'A', precio: 10, stock: 1, categoria, proveedorId });

    await crear('SKU-A', 'ropa');
    await crear('SKU-B', 'hogar');

    const res = await request(app)
      .get('/api/productos?categoria=ropa&limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].sku).toBe('SKU-A');
  });
});
