import { LoginInputDto, LoginResultDto, TokenPayloadDto } from '../../dtos/auth/auth.dtos';
import { ICredentialsPort } from '../../ports/credentials.port';
import { ITokenPort } from '../../ports/token.port';

export class AutenticarUsuarioUseCase {
    constructor(
        private readonly credentialsPort: ICredentialsPort,
        private readonly tokenPort: ITokenPort
    ) {}

    async execute(input: LoginInputDto): Promise<LoginResultDto> {
        if (!this.credentialsPort.isValid(input.email, input.password)) {
            return { success: false, error: 'Credenciais inválidas' };
        }

        const payload: TokenPayloadDto = {
            userId: 'mock-user',
            email: input.email,
        };

        const token = this.tokenPort.sign(payload);

        return { success: true, token };
    }
}
