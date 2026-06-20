import {
    CreateClienteInputDto,
    UpdateClienteInputDto,
    ClienteResponseDto,
} from '../../application/dtos/cliente/cliente.dtos';
import { CriarClienteUseCase } from '../../application/usecases/cliente/criar-cliente.usecase';
import { ListarClientesUseCase } from '../../application/usecases/cliente/listar-clientes.usecase';
import { BuscarClientePorIdUseCase } from '../../application/usecases/cliente/buscar-cliente-por-id.usecase';
import { BuscarClientePorCpfUseCase } from '../../application/usecases/cliente/buscar-cliente-por-cpf.usecase';
import { AtualizarClienteUseCase } from '../../application/usecases/cliente/atualizar-cliente.usecase';
import { DeletarClienteUseCase } from '../../application/usecases/cliente/deletar-cliente.usecase';
import { ClientePresenter } from '../presenters/cliente.presenter';

export class ClienteController {
    constructor(
        private readonly listarClientesUseCase: ListarClientesUseCase,
        private readonly buscarClientePorIdUseCase: BuscarClientePorIdUseCase,
        private readonly buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase,
        private readonly criarClienteUseCase: CriarClienteUseCase,
        private readonly atualizarClienteUseCase: AtualizarClienteUseCase,
        private readonly deletarClienteUseCase: DeletarClienteUseCase,
        private readonly presenter: ClientePresenter
    ) {}

    async getAllClientes(): Promise<ClienteResponseDto[]> {
        const clientes = await this.listarClientesUseCase.execute();
        return this.presenter.presentList(clientes);
    }

    async getClienteById(id: string): Promise<ClienteResponseDto | null> {
        const cliente = await this.buscarClientePorIdUseCase.execute(id);
        return cliente ? this.presenter.present(cliente) : null;
    }

    async getClienteByCpf(cpf: string): Promise<ClienteResponseDto | null> {
        const cliente = await this.buscarClientePorCpfUseCase.execute(cpf);
        return cliente ? this.presenter.present(cliente) : null;
    }

    async criarCliente(input: CreateClienteInputDto): Promise<ClienteResponseDto> {
        const cliente = await this.criarClienteUseCase.execute(input);
        return this.presenter.presentCreate(cliente);
    }

    async atualizarCliente(
        id: string,
        input: UpdateClienteInputDto
    ): Promise<ClienteResponseDto | null> {
        const cliente = await this.atualizarClienteUseCase.execute(id, input);
        return cliente ? this.presenter.present(cliente) : null;
    }

    async deletarCliente(id: string): Promise<boolean> {
        return this.deletarClienteUseCase.execute(id);
    }
}
