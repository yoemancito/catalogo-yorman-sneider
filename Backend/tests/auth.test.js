const request = require('supertest');
const app = require('../src/app');
const { conectarBD, limpiarBD, desconectarBD } = require('./helpers');

beforeAll(conectarBD);
afterAll(desconectarBD);
beforeEach(limpiarBD);

describe('Auth', () => {
  it('registra un admin y devuelve 201 SIN password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin@demo.com', password: 'secreta123', rol: 'admin' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('admin@demo.com');
    expect(res.body.rol).toBe('admin');
    expect(res.body.password).toBeUndefined();
    expect(res.body.id).toBeDefined();
  });

  it('email duplicado devuelve 409 tipado', async () => {
    await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: '123456' });
    const res = await request(app).post('/api/auth/register').send({ email: 'a@a.com', password: '123456' });

    expect(res.status).toBe(409);
    expect(res.body.codigo).toBeDefined();
  });

  it('email con formato invalido devuelve 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'no-es-email', password: '123456' });

    expect(res.status).toBe(400);
  });

  it('login correcto devuelve 200 con token', async () => {
    await request(app).post('/api/auth/register').send({ email: 'admin@demo.com', password: 'secreta123', rol: 'admin' });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@demo.com', password: 'secreta123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('login con password incorrecta devuelve 401', async () => {
    await request(app).post('/api/auth/register').send({ email: 'admin@demo.com', password: '123456' });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@demo.com', password: 'incorrecta' });

    expect(res.status).toBe(401);
  });

  it('ruta protegida sin token devuelve 401', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(401);
  });
});
