import { AuthenticatedUserResponseDto, LoginResponseDto } from '../../application/dtos/auth/auth.dtos';
import { AutenticarUsuarioUseCase } from '../../application/usecases/auth/autenticar-usuario.usecase';
import { ConsultarClienteAuthUseCase } from '../../application/usecases/auth/consultar-cliente-auth.usecase';

type UseCaseFactory<T> = () => T;

export class AuthController {
    constructor(
        private readonly getAutenticarUsuarioUseCase: UseCaseFactory<AutenticarUsuarioUseCase>,
        private readonly getConsultarClienteAuthUseCase: UseCaseFactory<ConsultarClienteAuthUseCase>
    ) {}

    async login(cpf: string): Promise<LoginResponseDto | { error: string; statusCode: number }> {
        const result = await this.getAutenticarUsuarioUseCase().execute({ cpf });

        if (!result.success || !result.token) {
            return {
                error: result.error ?? 'Acesso não autorizado',
                statusCode: result.statusCode ?? 401,
            };
        }

        return { token: result.token };
    }

    async lookupByCpf(cpf: string) {
        return this.getConsultarClienteAuthUseCase().execute(cpf);
    }

    toAuthenticatedUserResponse(payload: {
        userId: string;
        cpf: string;
        email: string;
    }): AuthenticatedUserResponseDto {
        return {
            userId: payload.userId,
            cpf: payload.cpf,
            email: payload.email,
        };
    }
}
