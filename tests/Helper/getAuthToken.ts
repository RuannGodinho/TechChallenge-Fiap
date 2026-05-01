import request from 'supertest';
import app from '../../app';

export async function getAuthToken() {
  const responseLogin = await request(app)
    .post('/api/login')
    .send({
      email: process.env.AUTH_EMAIL || 'admin@example.com',
      password: process.env.AUTH_PASSWORD || 'admin123'
    });

  expect(responseLogin.status).toBe(200);
  expect(responseLogin.body.token).toBeDefined();

  return responseLogin.body.token;
}