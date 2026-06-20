import { CreateClienteInputDto, UpdateClienteInputDto } from '../../application/dtos/cliente/cliente.dtos';
import { Cliente } from '../../enterprise/entities/cliente.entity';
import { IClienteService } from '../../Interfaces/Cliente/cliente-service.interface';
import { CriarClienteUseCase } from '../../application/usecases/cliente/criar-cliente.usecase';
import { ListarClientesUseCase } from '../../application/usecases/cliente/listar-clientes.usecase';
import { BuscarClientePorIdUseCase } from '../../application/usecases/cliente/buscar-cliente-por-id.usecase';
import { BuscarClientePorCpfUseCase } from '../../application/usecases/cliente/buscar-cliente-por-cpf.usecase';
import { AtualizarClienteUseCase } from '../../application/usecases/cliente/atualizar-cliente.usecase';
import { DeletarClienteUseCase } from '../../application/usecases/cliente/deletar-cliente.usecase';

export class ClienteServiceFacade implements IClienteService {
    constructor(
        private readonly listarClientesUseCase: ListarClientesUseCase,
        private readonly buscarClientePorIdUseCase: BuscarClientePorIdUseCase,
        private readonly buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase,
        private readonly criarClienteUseCase: CriarClienteUseCase,
        private readonly atualizarClienteUseCase: AtualizarClienteUseCase,
        private readonly deletarClienteUseCase: DeletarClienteUseCase
    ) {}

    async getAllClientes(): Promise<Cliente[]> {
        return this.listarClientesUseCase.execute();
    }

    async getClienteById(id: string): Promise<Cliente | null> {
        return this.buscarClientePorIdUseCase.execute(id);
    }

    async getClienteByCpf(cpf: string): Promise<Cliente | null> {
        return this.buscarClientePorCpfUseCase.execute(cpf);
    }

    async criarCliente(clienteData: {
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
    }): Promise<Cliente> {
        return this.criarClienteUseCase.execute(clienteData);
    }

    async atualizarCliente(
        id: string,
        clienteData: UpdateClienteInputDto
    ): Promise<Cliente | null> {
        return this.atualizarClienteUseCase.execute(id, clienteData);
    }

    async deletarCliente(id: string): Promise<boolean> {
        return this.deletarClienteUseCase.execute(id);
    }
}
