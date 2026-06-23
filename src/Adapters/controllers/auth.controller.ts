import { AuthenticatedUserResponseDto, LoginResponseDto } from '../../application/dtos/auth/auth.dtos';
import { AutenticarUsuarioUseCase } from '../../application/usecases/auth/autenticar-usuario.usecase';

type UseCaseFactory<T> = () => T;

export class AuthController {
    constructor(private readonly getAutenticarUsuarioUseCase: UseCaseFactory<AutenticarUsuarioUseCase>) {}

    async login(email: string, password: string): Promise<LoginResponseDto | { error: string }> {
        const result = await this.getAutenticarUsuarioUseCase().execute({ email, password });

        if (!result.success || !result.token) {
            return { error: result.error ?? 'Credenciais inválidas' };
        }

        return { token: result.token };
    }

    toAuthenticatedUserResponse(payload: { userId: string; email: string }): AuthenticatedUserResponseDto {
        return {
            userId: payload.userId,
            email: payload.email,
        };
    }
}
