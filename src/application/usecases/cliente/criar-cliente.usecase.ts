import { CreateClienteInputDto } from '../../dtos/cliente/cliente.dtos';
import { Cliente } from '../../../enterprise/entities/cliente.entity';
import { IClienteGateway } from '../../ports/cliente.gateway.port';

export interface ICriarClienteUseCase {
    execute(input: CreateClienteInputDto): Promise<Cliente>;
}

export class CriarClienteUseCase implements ICriarClienteUseCase {
    constructor(private readonly gateway: IClienteGateway) {}

    async execute(input: CreateClienteInputDto): Promise<Cliente> {
        try {
            const cliente = Cliente.create(
                input.nome,
                input.email,
                input.cpf,
                input.telefone
            );

            return await this.gateway.save(cliente);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Erro ao criar cliente:${message}`);
        }
    }
}
