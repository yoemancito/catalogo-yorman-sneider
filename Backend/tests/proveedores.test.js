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

describe('Proveedores', () => {
  it('crea proveedor: 201 y slug autogenerado en minúsculas', async () => {
    const token = await tokenDe('admin');
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Acme Corp' });

    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('acme-corp');
    expect(res.body.activo).toBe(true);
  });

  it('nombre duplicado devuelve 409', async () => {
    const token = await tokenDe('admin');
    await request(app).post('/api/proveedores').set('Authorization', `Bearer ${token}`).send({ nombre: 'Acme' });
    const res = await request(app).post('/api/proveedores').set('Authorization', `Bearer ${token}`).send({ nombre: 'Acme' });

    expect(res.status).toBe(409);
  });

  it('user recibe 403 en POST /proveedores', async () => {
    const token = await tokenDe('user');
    const res = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Acme' });

    expect(res.status).toBe(403);
  });

  it('eliminar proveedor sin productos: 204', async () => {
    const token = await tokenDe('admin');
    const creado = await request(app).post('/api/proveedores').set('Authorization', `Bearer ${token}`).send({ nombre: 'Solo' });
    const res = await request(app)
      .delete(`/api/proveedores/${creado.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('eliminar proveedor con productos: 409 (integridad)', async () => {
    const tokenAdmin = await tokenDe('admin');
    const proveedor = await request(app)
      .post('/api/proveedores')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre: 'Con Productos' });

    await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ sku: 'SKU-1', nombre: 'A', precio: 1, stock: 1, categoria: 'ropa', proveedorId: proveedor.body._id });

    const res = await request(app)
      .delete(`/api/proveedores/${proveedor.body._id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(409);
    expect(res.body.codigo).toBe('PROVEEDOR_CON_PRODUCTOS');
  });

  it('desactivar proveedor con PUT activo:false: 200', async () => {
    const token = await tokenDe('admin');
    const creado = await request(app).post('/api/proveedores').set('Authorization', `Bearer ${token}`).send({ nombre: 'Desactivable' });
    const res = await request(app)
      .put(`/api/proveedores/${creado.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ activo: false });

    expect(res.status).toBe(200);
    expect(res.body.activo).toBe(false);
  });
});
