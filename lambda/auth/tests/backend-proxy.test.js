const http = require('http');
const { EventEmitter } = require('events');

jest.mock('http', () => ({
  request: jest.fn(),
}));

const { handler } = require('../backend-proxy/handler');

describe('backend-proxy handler', () => {
  beforeEach(() => {
    process.env.BACKEND_URL = 'http://backend.test:3000';
    http.request.mockReset();
  });

  test('forwards request and injects authorizer headers', async () => {
    const response = new EventEmitter();
    response.statusCode = 200;
    response.headers = { 'content-type': 'application/json' };

    const request = new EventEmitter();
    request.write = jest.fn();
    request.end = jest.fn();

    http.request.mockImplementation((_url, _options, callback) => {
      callback(response);
      process.nextTick(() => {
        response.emit('data', Buffer.from('{"ok":true}'));
        response.emit('end');
      });
      return request;
    });

    const result = await handler({
      rawPath: '/api/clientes',
      headers: { host: 'localhost:3001', authorization: 'Bearer token' },
      requestContext: {
        http: { method: 'GET', path: '/api/clientes' },
        authorizer: {
          lambda: {
            userId: 'mock-user',
            email: 'admin@example.com',
          },
        },
      },
    });

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ ok: true });

    const [, options] = http.request.mock.calls[0];
    expect(options.method).toBe('GET');
    expect(options.headers['x-user-id']).toBe('mock-user');
    expect(options.headers['x-user-email']).toBe('admin@example.com');
    expect(options.headers.host).toBeUndefined();
  });

  test('returns 502 when backend is unavailable', async () => {
    const request = new EventEmitter();
    request.write = jest.fn();
    request.end = jest.fn();

    http.request.mockImplementation(() => {
      process.nextTick(() => request.emit('error', new Error('connect ECONNREFUSED')));
      return request;
    });

    const result = await handler({
      rawPath: '/api/clientes',
      headers: {},
      requestContext: {
        http: { method: 'GET', path: '/api/clientes' },
      },
    });

    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body).error).toBe('Backend indisponível');
  });
});
