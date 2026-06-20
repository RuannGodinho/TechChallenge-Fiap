import { Db } from 'mongodb';
import { connectDatabase } from '../database';
import { ClienteMongoGateway } from '../../Adapters/gateways/cliente.mongo.gateway';
import { VeiculoMongoGateway } from '../../Adapters/gateways/veiculo.mongo.gateway';
import { ClientePresenter } from '../../Adapters/presenters/cliente.presenter';
import { VeiculoPresenter } from '../../Adapters/presenters/veiculo.presenter';
import { ClienteController } from '../../Adapters/controllers/cliente.controller';
import { VeiculoController } from '../../Adapters/controllers/veiculo.controller';
import { ClienteServiceFacade } from '../../Adapters/facades/cliente-service.facade';
import { VeiculoServiceFacade } from '../../Adapters/facades/veiculo-service.facade';
import { CriarClienteUseCase } from '../../application/usecases/cliente/criar-cliente.usecase';
import { ListarClientesUseCase } from '../../application/usecases/cliente/listar-clientes.usecase';
import { BuscarClientePorIdUseCase } from '../../application/usecases/cliente/buscar-cliente-por-id.usecase';
import { BuscarClientePorCpfUseCase } from '../../application/usecases/cliente/buscar-cliente-por-cpf.usecase';
import { AtualizarClienteUseCase } from '../../application/usecases/cliente/atualizar-cliente.usecase';
import { DeletarClienteUseCase } from '../../application/usecases/cliente/deletar-cliente.usecase';
import { CriarVeiculoUseCase } from '../../application/usecases/veiculo/criar-veiculo.usecase';
import { ListarVeiculosUseCase } from '../../application/usecases/veiculo/listar-veiculos.usecase';
import { BuscarVeiculoPorIdUseCase } from '../../application/usecases/veiculo/buscar-veiculo-por-id.usecase';
import { AtualizarVeiculoUseCase } from '../../application/usecases/veiculo/atualizar-veiculo.usecase';
import { DeletarVeiculoUseCase } from '../../application/usecases/veiculo/deletar-veiculo.usecase';
import { IClienteGateway } from '../../application/ports/cliente.gateway.port';
import { IVeiculoGateway } from '../../application/ports/veiculo.gateway.port';

export class DIContainer {
    private static instance: DIContainer;

    private db: Db | null = null;
    private initialized = false;

    private clienteGateway: IClienteGateway | null = null;
    private veiculoGateway: IVeiculoGateway | null = null;
    private clienteGatewayInjected = false;
    private veiculoGatewayInjected = false;

    private clientePresenter: ClientePresenter | null = null;
    private veiculoPresenter: VeiculoPresenter | null = null;
    private clienteController: ClienteController | null = null;
    private veiculoController: VeiculoController | null = null;
    private clienteServiceFacade: ClienteServiceFacade | null = null;
    private veiculoServiceFacade: VeiculoServiceFacade | null = null;

    private criarClienteUseCase: CriarClienteUseCase | null = null;
    private listarClientesUseCase: ListarClientesUseCase | null = null;
    private buscarClientePorIdUseCase: BuscarClientePorIdUseCase | null = null;
    private buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase | null = null;
    private atualizarClienteUseCase: AtualizarClienteUseCase | null = null;
    private deletarClienteUseCase: DeletarClienteUseCase | null = null;

    private criarVeiculoUseCase: CriarVeiculoUseCase | null = null;
    private listarVeiculosUseCase: ListarVeiculosUseCase | null = null;
    private buscarVeiculoPorIdUseCase: BuscarVeiculoPorIdUseCase | null = null;
    private atualizarVeiculoUseCase: AtualizarVeiculoUseCase | null = null;
    private deletarVeiculoUseCase: DeletarVeiculoUseCase | null = null;

    private constructor() {}

    static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    async ensureInitialized(): Promise<void> {
        if (this.initialized) {
            return;
        }

        if (!this.clienteGatewayInjected || !this.veiculoGatewayInjected) {
            this.db = await connectDatabase();
        }

        this.initialized = true;
    }

    async initialize(): Promise<void> {
        await this.ensureInitialized();
    }

    getDb(): Db {
        if (!this.db) {
            throw new Error('DIContainer not initialized. Call await initialize() first.');
        }
        return this.db;
    }

    getClienteGateway(): IClienteGateway {
        if (!this.clienteGateway) {
            if (this.clienteGatewayInjected) {
                throw new Error('Cliente gateway not injected.');
            }
            this.clienteGateway = new ClienteMongoGateway(this.getDb());
        }
        return this.clienteGateway;
    }

    getVeiculoGateway(): IVeiculoGateway {
        if (!this.veiculoGateway) {
            if (this.veiculoGatewayInjected) {
                throw new Error('Veículo gateway not injected.');
            }
            this.veiculoGateway = new VeiculoMongoGateway(this.getDb());
        }
        return this.veiculoGateway;
    }

    getCriarClienteUseCase(): CriarClienteUseCase {
        if (!this.criarClienteUseCase) {
            this.criarClienteUseCase = new CriarClienteUseCase(this.getClienteGateway());
        }
        return this.criarClienteUseCase;
    }

    getListarClientesUseCase(): ListarClientesUseCase {
        if (!this.listarClientesUseCase) {
            this.listarClientesUseCase = new ListarClientesUseCase(this.getClienteGateway());
        }
        return this.listarClientesUseCase;
    }

    getBuscarClientePorIdUseCase(): BuscarClientePorIdUseCase {
        if (!this.buscarClientePorIdUseCase) {
            this.buscarClientePorIdUseCase = new BuscarClientePorIdUseCase(this.getClienteGateway());
        }
        return this.buscarClientePorIdUseCase;
    }

    getBuscarClientePorCpfUseCase(): BuscarClientePorCpfUseCase {
        if (!this.buscarClientePorCpfUseCase) {
            this.buscarClientePorCpfUseCase = new BuscarClientePorCpfUseCase(this.getClienteGateway());
        }
        return this.buscarClientePorCpfUseCase;
    }

    getAtualizarClienteUseCase(): AtualizarClienteUseCase {
        if (!this.atualizarClienteUseCase) {
            this.atualizarClienteUseCase = new AtualizarClienteUseCase(this.getClienteGateway());
        }
        return this.atualizarClienteUseCase;
    }

    getDeletarClienteUseCase(): DeletarClienteUseCase {
        if (!this.deletarClienteUseCase) {
            this.deletarClienteUseCase = new DeletarClienteUseCase(this.getClienteGateway());
        }
        return this.deletarClienteUseCase;
    }

    getCriarVeiculoUseCase(): CriarVeiculoUseCase {
        if (!this.criarVeiculoUseCase) {
            this.criarVeiculoUseCase = new CriarVeiculoUseCase(this.getVeiculoGateway());
        }
        return this.criarVeiculoUseCase;
    }

    getListarVeiculosUseCase(): ListarVeiculosUseCase {
        if (!this.listarVeiculosUseCase) {
            this.listarVeiculosUseCase = new ListarVeiculosUseCase(this.getVeiculoGateway());
        }
        return this.listarVeiculosUseCase;
    }

    getBuscarVeiculoPorIdUseCase(): BuscarVeiculoPorIdUseCase {
        if (!this.buscarVeiculoPorIdUseCase) {
            this.buscarVeiculoPorIdUseCase = new BuscarVeiculoPorIdUseCase(this.getVeiculoGateway());
        }
        return this.buscarVeiculoPorIdUseCase;
    }

    getAtualizarVeiculoUseCase(): AtualizarVeiculoUseCase {
        if (!this.atualizarVeiculoUseCase) {
            this.atualizarVeiculoUseCase = new AtualizarVeiculoUseCase(this.getVeiculoGateway());
        }
        return this.atualizarVeiculoUseCase;
    }

    getDeletarVeiculoUseCase(): DeletarVeiculoUseCase {
        if (!this.deletarVeiculoUseCase) {
            this.deletarVeiculoUseCase = new DeletarVeiculoUseCase(this.getVeiculoGateway());
        }
        return this.deletarVeiculoUseCase;
    }

    getClientePresenter(): ClientePresenter {
        if (!this.clientePresenter) {
            this.clientePresenter = new ClientePresenter();
        }
        return this.clientePresenter;
    }

    getVeiculoPresenter(): VeiculoPresenter {
        if (!this.veiculoPresenter) {
            this.veiculoPresenter = new VeiculoPresenter();
        }
        return this.veiculoPresenter;
    }

    getClienteController(): ClienteController {
        if (!this.clienteController) {
            this.clienteController = new ClienteController(
                this.getListarClientesUseCase(),
                this.getBuscarClientePorIdUseCase(),
                this.getBuscarClientePorCpfUseCase(),
                this.getCriarClienteUseCase(),
                this.getAtualizarClienteUseCase(),
                this.getDeletarClienteUseCase(),
                this.getClientePresenter()
            );
        }
        return this.clienteController;
    }

    getVeiculoController(): VeiculoController {
        if (!this.veiculoController) {
            this.veiculoController = new VeiculoController(
                this.getListarVeiculosUseCase(),
                this.getBuscarVeiculoPorIdUseCase(),
                this.getCriarVeiculoUseCase(),
                this.getAtualizarVeiculoUseCase(),
                this.getDeletarVeiculoUseCase(),
                this.getVeiculoPresenter()
            );
        }
        return this.veiculoController;
    }

    getClienteServiceFacade(): ClienteServiceFacade {
        if (!this.clienteServiceFacade) {
            this.clienteServiceFacade = new ClienteServiceFacade(
                this.getListarClientesUseCase(),
                this.getBuscarClientePorIdUseCase(),
                this.getBuscarClientePorCpfUseCase(),
                this.getCriarClienteUseCase(),
                this.getAtualizarClienteUseCase(),
                this.getDeletarClienteUseCase()
            );
        }
        return this.clienteServiceFacade;
    }

    getVeiculoServiceFacade(): VeiculoServiceFacade {
        if (!this.veiculoServiceFacade) {
            this.veiculoServiceFacade = new VeiculoServiceFacade(
                this.getListarVeiculosUseCase(),
                this.getBuscarVeiculoPorIdUseCase(),
                this.getCriarVeiculoUseCase(),
                this.getAtualizarVeiculoUseCase(),
                this.getDeletarVeiculoUseCase()
            );
        }
        return this.veiculoServiceFacade;
    }

    injectClienteGateway(gateway: IClienteGateway): void {
        this.clienteGateway = gateway;
        this.clienteGatewayInjected = true;
        this.initialized = true;
        this.resetClienteCache();
    }

    injectVeiculoGateway(gateway: IVeiculoGateway): void {
        this.veiculoGateway = gateway;
        this.veiculoGatewayInjected = true;
        this.initialized = true;
        this.resetVeiculoCache();
    }

    reset(): void {
        this.clienteGateway = null;
        this.veiculoGateway = null;
        this.clienteGatewayInjected = false;
        this.veiculoGatewayInjected = false;
        this.clientePresenter = null;
        this.veiculoPresenter = null;
        this.clienteController = null;
        this.veiculoController = null;
        this.clienteServiceFacade = null;
        this.veiculoServiceFacade = null;
        this.resetClienteCache();
        this.resetVeiculoCache();
        this.initialized = false;
        this.db = null;
    }

    private resetClienteCache(): void {
        this.criarClienteUseCase = null;
        this.listarClientesUseCase = null;
        this.buscarClientePorIdUseCase = null;
        this.buscarClientePorCpfUseCase = null;
        this.atualizarClienteUseCase = null;
        this.deletarClienteUseCase = null;
        this.clienteController = null;
        this.clienteServiceFacade = null;
    }

    private resetVeiculoCache(): void {
        this.criarVeiculoUseCase = null;
        this.listarVeiculosUseCase = null;
        this.buscarVeiculoPorIdUseCase = null;
        this.atualizarVeiculoUseCase = null;
        this.deletarVeiculoUseCase = null;
        this.veiculoController = null;
        this.veiculoServiceFacade = null;
    }
}

export function getDIContainer(): DIContainer {
    return DIContainer.getInstance();
}
