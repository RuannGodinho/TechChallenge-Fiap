import { AutenticarUsuarioUseCase } from '../../src/application/usecases/auth/autenticar-usuario.usecase';
import { VerificarTokenUseCase } from '../../src/application/usecases/auth/verificar-token.usecase';
import { ICredentialsPort } from '../../src/application/ports/credentials.port';
import { ITokenPort } from '../../src/application/ports/token.port';
import { authMock } from '../../src/config/auth';

describe('Auth use cases', () => {
    let credentialsPort: jest.Mocked<ICredentialsPort>;
    let tokenPort: jest.Mocked<ITokenPort>;

    beforeEach(() => {
        credentialsPort = {
            isValid: jest.fn(),
        };
        tokenPort = {
            sign: jest.fn(),
            verify: jest.fn(),
        };
    });

    test('autenticar usuario retorna token com credenciais validas', async () => {
        credentialsPort.isValid.mockReturnValue(true);
        tokenPort.sign.mockReturnValue('jwt-token');

        const useCase = new AutenticarUsuarioUseCase(credentialsPort, tokenPort);
        const result = await useCase.execute({
            email: authMock.email,
            password: authMock.password,
        });

        expect(result.success).toBe(true);
        expect(result.token).toBe('jwt-token');
        expect(tokenPort.sign).toHaveBeenCalledWith({
            userId: 'mock-user',
            email: authMock.email,
        });
    });

    test('autenticar usuario rejeita credenciais invalidas', async () => {
        credentialsPort.isValid.mockReturnValue(false);

        const useCase = new AutenticarUsuarioUseCase(credentialsPort, tokenPort);
        const result = await useCase.execute({
            email: 'wrong@example.com',
            password: 'badpass',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('Credenciais inválidas');
        expect(tokenPort.sign).not.toHaveBeenCalled();
    });

    test('verificar token retorna payload decodificado', () => {
        tokenPort.verify.mockReturnValue({
            userId: 'mock-user',
            email: authMock.email,
        });

        const useCase = new VerificarTokenUseCase(tokenPort);
        const result = useCase.execute('jwt-token');

        expect(result.email).toBe(authMock.email);
        expect(tokenPort.verify).toHaveBeenCalledWith('jwt-token');
    });
});
