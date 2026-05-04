import { AuthService, verifyToken } from '../../src/services/auth-service';

describe('AuthService', () => {
  const authService = new AuthService();

  test('deve gerar token válido com credenciais corretas', async () => {
    const result = await authService.login('admin@email.com', '123456');

    expect(result.success).toBe(true);
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');

    const decoded = verifyToken(result.token as string);
    expect(decoded.email).toBe('admin@email.com');
    expect(decoded.userId).toBe('mock-user');
  });

  test('deve rejeitar credenciais inválidas', async () => {
    const result = await authService.login('wrong@example.com', 'badpass');

    expect(result.success).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.error).toBe('Credenciais inválidas');
  });
});
