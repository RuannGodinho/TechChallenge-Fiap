import request from 'supertest';
import app from '../../app';

describe('Integração - Rotas de Autenticação', () => {
  test('deve retornar token ao fazer login com credenciais corretas', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe('string');
  });

  test('deve retornar 401 com credenciais incorretas', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@example.com', password: 'badpass' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Credenciais inválidas');
  });

  test('deve acessar rota protegida com token válido', async () => {
    const loginResponse = await request(app)
      .post('/api/login')
      .send({ email: 'admin@example.com', password: 'admin123' });

    const token = loginResponse.body.token;
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('admin@example.com');
  });

  test('deve recusar rota protegida com token inválido', async () => {
    const response = await request(app)
      .get('/api/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Token inválido');
  });
});
