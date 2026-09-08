import { LoginInputDto, LoginResultDto, TokenPayloadDto } from '../../dtos/auth/auth.dtos';
import { IClienteGateway } from '../../ports/cliente.gateway.port';
import { ITokenPort } from '../../ports/token.port';
import { Documento } from '../../../enterprise/value-objects/documento.vo';

export class AutenticarUsuarioUseCase {
    constructor(
        private readonly clienteGateway: IClienteGateway,
        private readonly tokenPort: ITokenPort
    ) {}

    async execute(input: LoginInputDto): Promise<LoginResultDto> {
        let documento: Documento;

        try {
            documento = Documento.from(input.cpf);
        } catch {
            return { success: false, statusCode: 400, error: 'CPF inválido' };
        }

        if (documento.type !== 'CPF') {
            return { success: false, statusCode: 400, error: 'Informe um CPF válido' };
        }

        const cliente = await this.clienteGateway.findByDocumento(documento);

        if (!cliente) {
            return { success: false, statusCode: 401, error: 'Cliente não encontrado' };
        }

        if (!cliente.status.isAtivo()) {
            return { success: false, statusCode: 403, error: 'Cliente inativo' };
        }

        const payload: TokenPayloadDto = {
            userId: cliente.id ?? cliente.documento.value,
            cpf: cliente.documento.value,
            email: cliente.email.value,
        };

        return { success: true, token: this.tokenPort.sign(payload) };
    }
}
