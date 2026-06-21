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
import { PecaMongoGateway } from '../../Adapters/gateways/peca.mongo.gateway';
import { PecaPresenter } from '../../Adapters/presenters/peca.presenter';
import { PecaController } from '../../Adapters/controllers/peca.controller';
import { PecaServiceFacade } from '../../Adapters/facades/peca-service.facade';
import { ServicoMongoGateway } from '../../Adapters/gateways/servico.mongo.gateway';
import { ServicoPresenter } from '../../Adapters/presenters/servico.presenter';
import { ServicoController } from '../../Adapters/controllers/servico.controller';
import { ServicoServiceFacade } from '../../Adapters/facades/servico-service.facade';
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
import { CriarPecaUseCase } from '../../application/usecases/peca/criar-peca.usecase';
import { ListarPecasUseCase } from '../../application/usecases/peca/listar-pecas.usecase';
import { BuscarPecaPorIdUseCase } from '../../application/usecases/peca/buscar-peca-por-id.usecase';
import { AtualizarPecaUseCase } from '../../application/usecases/peca/atualizar-peca.usecase';
import { DeletarPecaUseCase } from '../../application/usecases/peca/deletar-peca.usecase';
import { CriarServicoUseCase } from '../../application/usecases/servico/criar-servico.usecase';
import { ListarServicosUseCase } from '../../application/usecases/servico/listar-servicos.usecase';
import { BuscarServicoPorIdUseCase } from '../../application/usecases/servico/buscar-servico-por-id.usecase';
import { AtualizarServicoUseCase } from '../../application/usecases/servico/atualizar-servico.usecase';
import { DeletarServicoUseCase } from '../../application/usecases/servico/deletar-servico.usecase';
import { IClienteGateway } from '../../application/ports/cliente.gateway.port';
import { IVeiculoGateway } from '../../application/ports/veiculo.gateway.port';
import { IPecaGateway } from '../../application/ports/peca.gateway.port';
import { IServicoGateway } from '../../application/ports/servico.gateway.port';

export class DIContainer {
    private static instance: DIContainer;

    private db: Db | null = null;
    private initialized = false;

    private clienteGateway: IClienteGateway | null = null;
    private veiculoGateway: IVeiculoGateway | null = null;
    private pecaGateway: IPecaGateway | null = null;
    private servicoGateway: IServicoGateway | null = null;
    private clienteGatewayInjected = false;
    private veiculoGatewayInjected = false;
    private pecaGatewayInjected = false;
    private servicoGatewayInjected = false;

    private clientePresenter: ClientePresenter | null = null;
    private veiculoPresenter: VeiculoPresenter | null = null;
    private pecaPresenter: PecaPresenter | null = null;
    private servicoPresenter: ServicoPresenter | null = null;
    private clienteController: ClienteController | null = null;
    private veiculoController: VeiculoController | null = null;
    private pecaController: PecaController | null = null;
    private servicoController: ServicoController | null = null;
    private clienteServiceFacade: ClienteServiceFacade | null = null;
    private veiculoServiceFacade: VeiculoServiceFacade | null = null;
    private pecaServiceFacade: PecaServiceFacade | null = null;
    private servicoServiceFacade: ServicoServiceFacade | null = null;

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

    private criarPecaUseCase: CriarPecaUseCase | null = null;
    private listarPecasUseCase: ListarPecasUseCase | null = null;
    private buscarPecaPorIdUseCase: BuscarPecaPorIdUseCase | null = null;
    private atualizarPecaUseCase: AtualizarPecaUseCase | null = null;
    private deletarPecaUseCase: DeletarPecaUseCase | null = null;

    private criarServicoUseCase: CriarServicoUseCase | null = null;
    private listarServicosUseCase: ListarServicosUseCase | null = null;
    private buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase | null = null;
    private atualizarServicoUseCase: AtualizarServicoUseCase | null = null;
    private deletarServicoUseCase: DeletarServicoUseCase | null = null;

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

        if (
            !this.clienteGatewayInjected ||
            !this.veiculoGatewayInjected ||
            !this.pecaGatewayInjected ||
            !this.servicoGatewayInjected
        ) {
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

    getPecaGateway(): IPecaGateway {
        if (!this.pecaGateway) {
            if (this.pecaGatewayInjected) {
                throw new Error('Peça gateway not injected.');
            }
            this.pecaGateway = new PecaMongoGateway(this.getDb());
        }
        return this.pecaGateway;
    }

    getServicoGateway(): IServicoGateway {
        if (!this.servicoGateway) {
            if (this.servicoGatewayInjected) {
                throw new Error('Serviço gateway not injected.');
            }
            this.servicoGateway = new ServicoMongoGateway(this.getDb());
        }
        return this.servicoGateway;
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

    getCriarPecaUseCase(): CriarPecaUseCase {
        if (!this.criarPecaUseCase) {
            this.criarPecaUseCase = new CriarPecaUseCase(this.getPecaGateway());
        }
        return this.criarPecaUseCase;
    }

    getListarPecasUseCase(): ListarPecasUseCase {
        if (!this.listarPecasUseCase) {
            this.listarPecasUseCase = new ListarPecasUseCase(this.getPecaGateway());
        }
        return this.listarPecasUseCase;
    }

    getBuscarPecaPorIdUseCase(): BuscarPecaPorIdUseCase {
        if (!this.buscarPecaPorIdUseCase) {
            this.buscarPecaPorIdUseCase = new BuscarPecaPorIdUseCase(this.getPecaGateway());
        }
        return this.buscarPecaPorIdUseCase;
    }

    getAtualizarPecaUseCase(): AtualizarPecaUseCase {
        if (!this.atualizarPecaUseCase) {
            this.atualizarPecaUseCase = new AtualizarPecaUseCase(this.getPecaGateway());
        }
        return this.atualizarPecaUseCase;
    }

    getDeletarPecaUseCase(): DeletarPecaUseCase {
        if (!this.deletarPecaUseCase) {
            this.deletarPecaUseCase = new DeletarPecaUseCase(this.getPecaGateway());
        }
        return this.deletarPecaUseCase;
    }

    getCriarServicoUseCase(): CriarServicoUseCase {
        if (!this.criarServicoUseCase) {
            this.criarServicoUseCase = new CriarServicoUseCase(this.getServicoGateway());
        }
        return this.criarServicoUseCase;
    }

    getListarServicosUseCase(): ListarServicosUseCase {
        if (!this.listarServicosUseCase) {
            this.listarServicosUseCase = new ListarServicosUseCase(this.getServicoGateway());
        }
        return this.listarServicosUseCase;
    }

    getBuscarServicoPorIdUseCase(): BuscarServicoPorIdUseCase {
        if (!this.buscarServicoPorIdUseCase) {
            this.buscarServicoPorIdUseCase = new BuscarServicoPorIdUseCase(this.getServicoGateway());
        }
        return this.buscarServicoPorIdUseCase;
    }

    getAtualizarServicoUseCase(): AtualizarServicoUseCase {
        if (!this.atualizarServicoUseCase) {
            this.atualizarServicoUseCase = new AtualizarServicoUseCase(this.getServicoGateway());
        }
        return this.atualizarServicoUseCase;
    }

    getDeletarServicoUseCase(): DeletarServicoUseCase {
        if (!this.deletarServicoUseCase) {
            this.deletarServicoUseCase = new DeletarServicoUseCase(this.getServicoGateway());
        }
        return this.deletarServicoUseCase;
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

    getPecaPresenter(): PecaPresenter {
        if (!this.pecaPresenter) {
            this.pecaPresenter = new PecaPresenter();
        }
        return this.pecaPresenter;
    }

    getServicoPresenter(): ServicoPresenter {
        if (!this.servicoPresenter) {
            this.servicoPresenter = new ServicoPresenter();
        }
        return this.servicoPresenter;
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

    getPecaController(): PecaController {
        if (!this.pecaController) {
            this.pecaController = new PecaController(
                this.getListarPecasUseCase(),
                this.getBuscarPecaPorIdUseCase(),
                this.getCriarPecaUseCase(),
                this.getAtualizarPecaUseCase(),
                this.getDeletarPecaUseCase(),
                this.getPecaPresenter()
            );
        }
        return this.pecaController;
    }

    getServicoController(): ServicoController {
        if (!this.servicoController) {
            this.servicoController = new ServicoController(
                this.getListarServicosUseCase(),
                this.getBuscarServicoPorIdUseCase(),
                this.getCriarServicoUseCase(),
                this.getAtualizarServicoUseCase(),
                this.getDeletarServicoUseCase(),
                this.getServicoPresenter()
            );
        }
        return this.servicoController;
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

    getPecaServiceFacade(): PecaServiceFacade {
        if (!this.pecaServiceFacade) {
            this.pecaServiceFacade = new PecaServiceFacade(
                this.getListarPecasUseCase(),
                this.getBuscarPecaPorIdUseCase(),
                this.getCriarPecaUseCase(),
                this.getAtualizarPecaUseCase(),
                this.getDeletarPecaUseCase()
            );
        }
        return this.pecaServiceFacade;
    }

    getServicoServiceFacade(): ServicoServiceFacade {
        if (!this.servicoServiceFacade) {
            this.servicoServiceFacade = new ServicoServiceFacade(
                this.getListarServicosUseCase(),
                this.getBuscarServicoPorIdUseCase(),
                this.getCriarServicoUseCase(),
                this.getAtualizarServicoUseCase(),
                this.getDeletarServicoUseCase()
            );
        }
        return this.servicoServiceFacade;
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

    injectPecaGateway(gateway: IPecaGateway): void {
        this.pecaGateway = gateway;
        this.pecaGatewayInjected = true;
        this.initialized = true;
        this.resetPecaCache();
    }

    injectServicoGateway(gateway: IServicoGateway): void {
        this.servicoGateway = gateway;
        this.servicoGatewayInjected = true;
        this.initialized = true;
        this.resetServicoCache();
    }

    reset(): void {
        this.clienteGateway = null;
        this.veiculoGateway = null;
        this.pecaGateway = null;
        this.servicoGateway = null;
        this.clienteGatewayInjected = false;
        this.veiculoGatewayInjected = false;
        this.pecaGatewayInjected = false;
        this.servicoGatewayInjected = false;
        this.clientePresenter = null;
        this.veiculoPresenter = null;
        this.pecaPresenter = null;
        this.servicoPresenter = null;
        this.clienteController = null;
        this.veiculoController = null;
        this.pecaController = null;
        this.servicoController = null;
        this.clienteServiceFacade = null;
        this.veiculoServiceFacade = null;
        this.pecaServiceFacade = null;
        this.servicoServiceFacade = null;
        this.resetClienteCache();
        this.resetVeiculoCache();
        this.resetPecaCache();
        this.resetServicoCache();
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

    private resetPecaCache(): void {
        this.criarPecaUseCase = null;
        this.listarPecasUseCase = null;
        this.buscarPecaPorIdUseCase = null;
        this.atualizarPecaUseCase = null;
        this.deletarPecaUseCase = null;
        this.pecaController = null;
        this.pecaServiceFacade = null;
    }

    private resetServicoCache(): void {
        this.criarServicoUseCase = null;
        this.listarServicosUseCase = null;
        this.buscarServicoPorIdUseCase = null;
        this.atualizarServicoUseCase = null;
        this.deletarServicoUseCase = null;
        this.servicoController = null;
        this.servicoServiceFacade = null;
    }
}

export function getDIContainer(): DIContainer {
    return DIContainer.getInstance();
}
