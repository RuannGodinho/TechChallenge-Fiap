import { Db } from 'mongodb';
import { connectDatabase } from '../database';
import { ClienteMongoGateway } from '../../Adapters/gateways/cliente.mongo.gateway';
import { VeiculoMongoGateway } from '../../Adapters/gateways/veiculo.mongo.gateway';
import { ClientePresenter } from '../../Adapters/presenters/cliente.presenter';
import { VeiculoPresenter } from '../../Adapters/presenters/veiculo.presenter';
import { ClienteController } from '../../Adapters/controllers/cliente.controller';
import { VeiculoController } from '../../Adapters/controllers/veiculo.controller';
import { PecaMongoGateway } from '../../Adapters/gateways/peca.mongo.gateway';
import { PecaPresenter } from '../../Adapters/presenters/peca.presenter';
import { PecaController } from '../../Adapters/controllers/peca.controller';
import { ServicoMongoGateway } from '../../Adapters/gateways/servico.mongo.gateway';
import { ServicoPresenter } from '../../Adapters/presenters/servico.presenter';
import { ServicoController } from '../../Adapters/controllers/servico.controller';
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
import { EstoqueMongoGateway } from '../../Adapters/gateways/estoque.mongo.gateway';
import { MovimentacaoEstoqueMongoGateway } from '../../Adapters/gateways/movimentacao-estoque.mongo.gateway';
import { EstoquePresenter } from '../../Adapters/presenters/estoque.presenter';
import { EstoqueController } from '../../Adapters/controllers/estoque.controller';
import { RegistrarMovimentacaoEstoqueUseCase } from '../../application/usecases/estoque/registrar-movimentacao-estoque.usecase';
import { ListarEstoqueUseCase } from '../../application/usecases/estoque/listar-estoque.usecase';
import { BuscarEstoquePorPecaIdUseCase } from '../../application/usecases/estoque/buscar-estoque-por-peca-id.usecase';
import { ListarMovimentacoesEstoqueUseCase } from '../../application/usecases/estoque/listar-movimentacoes-estoque.usecase';
import { IEstoqueGateway } from '../../application/ports/estoque.gateway.port';
import { IMovimentacaoEstoqueGateway } from '../../application/ports/movimentacao-estoque.gateway.port';
import { OrdemServicoMongoGateway } from '../../Adapters/gateways/ordem-servico.mongo.gateway';
import { OrdemServicoPresenter } from '../../Adapters/presenters/ordem-servico.presenter';
import { OrdemServicoController } from '../../Adapters/controllers/ordem-servico.controller';
import { CriarOrdemServicoUseCase } from '../../application/usecases/ordem-servico/criar-ordem-servico.usecase';
import { ListarOrdensServicoUseCase } from '../../application/usecases/ordem-servico/listar-ordens-servico.usecase';
import { BuscarOrdemServicoPorIdUseCase } from '../../application/usecases/ordem-servico/buscar-ordem-servico-por-id.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { AtualizarOrdemServicoUseCase } from '../../application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { ObterDetalhesOrdemServicoUseCase } from '../../application/usecases/ordem-servico/obter-detalhes-ordem-servico.usecase';
import { BuscarOrdensPorCpfCnpjUseCase } from '../../application/usecases/ordem-servico/buscar-ordens-por-cpf-cnpj.usecase';
import { ClienteLookupAdapter } from '../../Adapters/adapters/cliente-lookup.adapter';
import { VeiculoLookupAdapter } from '../../Adapters/adapters/veiculo-lookup.adapter';
import { ExecucaoServicoPortAdapter } from '../../Adapters/adapters/execucao-servico.port.adapter';
import { ExecucaoServicoMongoGateway } from '../../Adapters/gateways/execucao-servico.mongo.gateway';
import { ExecucaoServicoPresenter } from '../../Adapters/presenters/execucao-servico.presenter';
import { ExecucaoServicoController } from '../../Adapters/controllers/execucao-servico.controller';
import { CriarExecucoesParaServicosUseCase } from '../../application/usecases/execucao-servico/criar-execucoes-para-servicos.usecase';
import { IniciarExecucaoUseCase } from '../../application/usecases/execucao-servico/iniciar-execucao.usecase';
import { FinalizarExecucaoUseCase } from '../../application/usecases/execucao-servico/finalizar-execucao.usecase';
import { ListarExecucoesPorOrdemUseCase } from '../../application/usecases/execucao-servico/listar-execucoes-por-ordem.usecase';
import { ObterTempoMedioServicosUseCase } from '../../application/usecases/execucao-servico/obter-tempo-medio-servicos.usecase';
import { IExecucaoServicoGateway } from '../../application/ports/execucao-servico.gateway.port';
import { PecaLookupAdapter } from '../../Adapters/adapters/peca-lookup.adapter';
import { ServicoLookupAdapter } from '../../Adapters/adapters/servico-lookup.adapter';
import { EstoqueMovimentacaoAdapter } from '../../Adapters/adapters/estoque-movimentacao.adapter';
import { OrcamentoPortAdapter } from '../../Adapters/adapters/orcamento.port.adapter';
import { OrcamentoMongoGateway } from '../../Adapters/gateways/orcamento.mongo.gateway';
import { OrcamentoPresenter } from '../../Adapters/presenters/orcamento.presenter';
import { OrcamentoController } from '../../Adapters/controllers/orcamento.controller';
import { CriarOrcamentoPendenteUseCase } from '../../application/usecases/orcamento/criar-orcamento-pendente.usecase';
import { AtualizarOrcamentoUseCase } from '../../application/usecases/orcamento/atualizar-orcamento.usecase';
import { ListarOrcamentosPorOrdemUseCase } from '../../application/usecases/orcamento/listar-orcamentos-por-ordem.usecase';
import { VerificarUltimoOrcamentoAprovadoUseCase } from '../../application/usecases/orcamento/verificar-ultimo-orcamento-aprovado.usecase';
import { IOrcamentoGateway } from '../../application/ports/orcamento.gateway.port';
import { JwtTokenAdapter } from '../../Adapters/adapters/jwt-token.adapter';
import { EnvCredentialsAdapter } from '../../Adapters/adapters/env-credentials.adapter';
import { AuthController } from '../../Adapters/controllers/auth.controller';
import { AutenticarUsuarioUseCase } from '../../application/usecases/auth/autenticar-usuario.usecase';
import { VerificarTokenUseCase } from '../../application/usecases/auth/verificar-token.usecase';
import { ITokenPort } from '../../application/ports/token.port';
import { ICredentialsPort } from '../../application/ports/credentials.port';
import { IOrdemServicoGateway } from '../../application/ports/ordem-servico.gateway.port';
import { IClienteLookupPort } from '../../application/ports/cliente-lookup.port';
import { IVeiculoLookupPort } from '../../application/ports/veiculo-lookup.port';
import { IExecucaoServicoPort } from '../../application/ports/execucao-servico.port';
import { IPecaLookupPort } from '../../application/ports/peca-lookup.port';
import { IServicoLookupPort } from '../../application/ports/servico-lookup.port';
import { IEstoqueMovimentacaoPort } from '../../application/ports/estoque-movimentacao.port';
import { IOrcamentoPort } from '../../application/ports/orcamento.port';
import { IEmailPort } from '../../application/ports/email.port';
import { NodemailerEmailAdapter } from '../../Adapters/adapters/nodemailer-email.adapter';
import { loadSmtpConfig } from '../../config/smtp';
import { IObservabilityPort } from '../../application/ports/observability.port';
import { PinoObservabilityAdapter } from '../logging/pino-observability.adapter';

export class DIContainer {
    private static instance: DIContainer;

    private db: Db | null = null;
    private initialized = false;

    private clienteGateway: IClienteGateway | null = null;
    private veiculoGateway: IVeiculoGateway | null = null;
    private pecaGateway: IPecaGateway | null = null;
    private servicoGateway: IServicoGateway | null = null;
    private estoqueGateway: IEstoqueGateway | null = null;
    private movimentacaoEstoqueGateway: IMovimentacaoEstoqueGateway | null = null;
    private ordemServicoGateway: IOrdemServicoGateway | null = null;
    private execucaoServicoGateway: IExecucaoServicoGateway | null = null;
    private orcamentoGateway: IOrcamentoGateway | null = null;
    private tokenPort: ITokenPort | null = null;
    private credentialsPort: ICredentialsPort | null = null;
    private emailPort: IEmailPort | null = null;
    private observabilityPort: IObservabilityPort | null = null;
    private observabilityPortInjected = false;
    private clienteGatewayInjected = false;
    private veiculoGatewayInjected = false;
    private pecaGatewayInjected = false;
    private servicoGatewayInjected = false;
    private estoqueGatewayInjected = false;
    private movimentacaoEstoqueGatewayInjected = false;
    private ordemServicoGatewayInjected = false;
    private execucaoServicoGatewayInjected = false;
    private orcamentoGatewayInjected = false;
    private tokenPortInjected = false;
    private credentialsPortInjected = false;
    private emailPortInjected = false;

    private clientePresenter: ClientePresenter | null = null;
    private veiculoPresenter: VeiculoPresenter | null = null;
    private pecaPresenter: PecaPresenter | null = null;
    private servicoPresenter: ServicoPresenter | null = null;
    private estoquePresenter: EstoquePresenter | null = null;
    private clienteController: ClienteController | null = null;
    private veiculoController: VeiculoController | null = null;
    private pecaController: PecaController | null = null;
    private servicoController: ServicoController | null = null;
    private estoqueController: EstoqueController | null = null;
    private ordemServicoController: OrdemServicoController | null = null;
    private execucaoServicoController: ExecucaoServicoController | null = null;
    private orcamentoController: OrcamentoController | null = null;
    private authController: AuthController | null = null;

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

    private registrarMovimentacaoEstoqueUseCase: RegistrarMovimentacaoEstoqueUseCase | null = null;
    private listarEstoqueUseCase: ListarEstoqueUseCase | null = null;
    private buscarEstoquePorPecaIdUseCase: BuscarEstoquePorPecaIdUseCase | null = null;
    private listarMovimentacoesEstoqueUseCase: ListarMovimentacoesEstoqueUseCase | null = null;

    private criarOrdemServicoUseCase: CriarOrdemServicoUseCase | null = null;
    private listarOrdensServicoUseCase: ListarOrdensServicoUseCase | null = null;
    private buscarOrdemServicoPorIdUseCase: BuscarOrdemServicoPorIdUseCase | null = null;
    private alterarStatusOrdemServicoUseCase: AlterarStatusOrdemServicoUseCase | null = null;
    private atualizarItensOrdemServicoUseCase: AtualizarItensOrdemServicoUseCase | null = null;
    private atualizarOrdemServicoUseCase: AtualizarOrdemServicoUseCase | null = null;
    private obterDetalhesOrdemServicoUseCase: ObterDetalhesOrdemServicoUseCase | null = null;
    private buscarOrdensPorCpfCnpjUseCase: BuscarOrdensPorCpfCnpjUseCase | null = null;
    private criarExecucoesParaServicosUseCase: CriarExecucoesParaServicosUseCase | null = null;
    private iniciarExecucaoUseCase: IniciarExecucaoUseCase | null = null;
    private finalizarExecucaoUseCase: FinalizarExecucaoUseCase | null = null;
    private listarExecucoesPorOrdemUseCase: ListarExecucoesPorOrdemUseCase | null = null;
    private obterTempoMedioServicosUseCase: ObterTempoMedioServicosUseCase | null = null;
    private criarOrcamentoPendenteUseCase: CriarOrcamentoPendenteUseCase | null = null;
    private atualizarOrcamentoUseCase: AtualizarOrcamentoUseCase | null = null;
    private listarOrcamentosPorOrdemUseCase: ListarOrcamentosPorOrdemUseCase | null = null;
    private verificarUltimoOrcamentoAprovadoUseCase: VerificarUltimoOrcamentoAprovadoUseCase | null = null;
    private autenticarUsuarioUseCase: AutenticarUsuarioUseCase | null = null;
    private verificarTokenUseCase: VerificarTokenUseCase | null = null;
    private clienteLookupPort: IClienteLookupPort | null = null;
    private veiculoLookupPort: IVeiculoLookupPort | null = null;
    private execucaoServicoPort: IExecucaoServicoPort | null = null;
    private execucaoServicoPortInjected = false;
    private pecaLookupPort: IPecaLookupPort | null = null;
    private servicoLookupPort: IServicoLookupPort | null = null;
    private estoqueMovimentacaoPort: IEstoqueMovimentacaoPort | null = null;
    private orcamentoPort: IOrcamentoPort | null = null;
    private orcamentoPortInjected = false;
    private ordemServicoPresenter: OrdemServicoPresenter | null = null;
    private execucaoServicoPresenter: ExecucaoServicoPresenter | null = null;
    private orcamentoPresenter: OrcamentoPresenter | null = null;

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
            !this.servicoGatewayInjected ||
            !this.estoqueGatewayInjected ||
            !this.movimentacaoEstoqueGatewayInjected ||
            !this.ordemServicoGatewayInjected ||
            !this.execucaoServicoGatewayInjected ||
            !this.orcamentoGatewayInjected
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

    getEstoqueGateway(): IEstoqueGateway {
        if (!this.estoqueGateway) {
            if (this.estoqueGatewayInjected) {
                throw new Error('Estoque gateway not injected.');
            }
            this.estoqueGateway = new EstoqueMongoGateway(this.getDb());
        }
        return this.estoqueGateway;
    }

    getMovimentacaoEstoqueGateway(): IMovimentacaoEstoqueGateway {
        if (!this.movimentacaoEstoqueGateway) {
            if (this.movimentacaoEstoqueGatewayInjected) {
                throw new Error('Movimentação estoque gateway not injected.');
            }
            this.movimentacaoEstoqueGateway = new MovimentacaoEstoqueMongoGateway(this.getDb());
        }
        return this.movimentacaoEstoqueGateway;
    }

    getOrdemServicoGateway(): IOrdemServicoGateway {
        if (!this.ordemServicoGateway) {
            if (this.ordemServicoGatewayInjected) {
                throw new Error('Ordem de serviço gateway not injected.');
            }
            this.ordemServicoGateway = new OrdemServicoMongoGateway(
                this.getDb(),
                this.getObservabilityPort()
            );
        }
        return this.ordemServicoGateway;
    }

    getExecucaoServicoGateway(): IExecucaoServicoGateway {
        if (!this.execucaoServicoGateway) {
            if (this.execucaoServicoGatewayInjected) {
                throw new Error('Execução de serviço gateway not injected.');
            }
            this.execucaoServicoGateway = new ExecucaoServicoMongoGateway(this.getDb());
        }
        return this.execucaoServicoGateway;
    }

    getOrcamentoGateway(): IOrcamentoGateway {
        if (!this.orcamentoGateway) {
            if (this.orcamentoGatewayInjected) {
                throw new Error('Orçamento gateway not injected.');
            }
            this.orcamentoGateway = new OrcamentoMongoGateway(this.getDb());
        }
        return this.orcamentoGateway;
    }

    getTokenPort(): ITokenPort {
        if (!this.tokenPort) {
            if (this.tokenPortInjected) {
                throw new Error('Token port not injected.');
            }
            this.tokenPort = new JwtTokenAdapter();
        }
        return this.tokenPort;
    }

    getObservabilityPort(): IObservabilityPort {
        if (!this.observabilityPort) {
            if (this.observabilityPortInjected) {
                throw new Error('Observability port not injected.');
            }
            this.observabilityPort = new PinoObservabilityAdapter();
        }
        return this.observabilityPort;
    }

    getEmailPort(): IEmailPort {
        if (!this.emailPort) {
            if (this.emailPortInjected) {
                throw new Error('EmailPort was injected but is null');
            }
            this.emailPort = new NodemailerEmailAdapter(loadSmtpConfig());
        }
        return this.emailPort;
    }

    getCredentialsPort(): ICredentialsPort {
        if (!this.credentialsPort) {
            if (this.credentialsPortInjected) {
                throw new Error('Credentials port not injected.');
            }
            this.credentialsPort = new EnvCredentialsAdapter();
        }
        return this.credentialsPort;
    }

    getAutenticarUsuarioUseCase(): AutenticarUsuarioUseCase {
        if (!this.autenticarUsuarioUseCase) {
            this.autenticarUsuarioUseCase = new AutenticarUsuarioUseCase(
                this.getCredentialsPort(),
                this.getTokenPort()
            );
        }
        return this.autenticarUsuarioUseCase;
    }

    getVerificarTokenUseCase(): VerificarTokenUseCase {
        if (!this.verificarTokenUseCase) {
            this.verificarTokenUseCase = new VerificarTokenUseCase(this.getTokenPort());
        }
        return this.verificarTokenUseCase;
    }

    getAuthController(): AuthController {
        if (!this.authController) {
            this.authController = new AuthController(() => this.getAutenticarUsuarioUseCase());
        }
        return this.authController;
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

    getRegistrarMovimentacaoEstoqueUseCase(): RegistrarMovimentacaoEstoqueUseCase {
        if (!this.registrarMovimentacaoEstoqueUseCase) {
            this.registrarMovimentacaoEstoqueUseCase = new RegistrarMovimentacaoEstoqueUseCase(
                this.getEstoqueGateway(),
                this.getMovimentacaoEstoqueGateway(),
                this.getPecaGateway()
            );
        }
        return this.registrarMovimentacaoEstoqueUseCase;
    }

    getListarEstoqueUseCase(): ListarEstoqueUseCase {
        if (!this.listarEstoqueUseCase) {
            this.listarEstoqueUseCase = new ListarEstoqueUseCase(this.getEstoqueGateway());
        }
        return this.listarEstoqueUseCase;
    }

    getBuscarEstoquePorPecaIdUseCase(): BuscarEstoquePorPecaIdUseCase {
        if (!this.buscarEstoquePorPecaIdUseCase) {
            this.buscarEstoquePorPecaIdUseCase = new BuscarEstoquePorPecaIdUseCase(
                this.getEstoqueGateway()
            );
        }
        return this.buscarEstoquePorPecaIdUseCase;
    }

    getListarMovimentacoesEstoqueUseCase(): ListarMovimentacoesEstoqueUseCase {
        if (!this.listarMovimentacoesEstoqueUseCase) {
            this.listarMovimentacoesEstoqueUseCase = new ListarMovimentacoesEstoqueUseCase(
                this.getMovimentacaoEstoqueGateway()
            );
        }
        return this.listarMovimentacoesEstoqueUseCase;
    }

    getClienteLookupPort(): IClienteLookupPort {
        if (!this.clienteLookupPort) {
            this.clienteLookupPort = new ClienteLookupAdapter(this.getBuscarClientePorCpfUseCase());
        }
        return this.clienteLookupPort;
    }

    getVeiculoLookupPort(): IVeiculoLookupPort {
        if (!this.veiculoLookupPort) {
            this.veiculoLookupPort = new VeiculoLookupAdapter(this.getBuscarVeiculoPorIdUseCase());
        }
        return this.veiculoLookupPort;
    }

    getExecucaoServicoPort(): IExecucaoServicoPort {
        if (!this.execucaoServicoPort) {
            if (this.execucaoServicoPortInjected) {
                throw new Error('Execução serviço port not injected.');
            }
            this.execucaoServicoPort = new ExecucaoServicoPortAdapter(
                this.getCriarExecucoesParaServicosUseCase()
            );
        }
        return this.execucaoServicoPort;
    }

    getCriarExecucoesParaServicosUseCase(): CriarExecucoesParaServicosUseCase {
        if (!this.criarExecucoesParaServicosUseCase) {
            this.criarExecucoesParaServicosUseCase = new CriarExecucoesParaServicosUseCase(
                this.getExecucaoServicoGateway(),
                this.getOrdemServicoGateway(),
                this.getServicoLookupPort()
            );
        }
        return this.criarExecucoesParaServicosUseCase;
    }

    getIniciarExecucaoUseCase(): IniciarExecucaoUseCase {
        if (!this.iniciarExecucaoUseCase) {
            this.iniciarExecucaoUseCase = new IniciarExecucaoUseCase(
                this.getExecucaoServicoGateway(),
                this.getOrdemServicoGateway(),
                this.getObservabilityPort()
            );
        }
        return this.iniciarExecucaoUseCase;
    }

    getFinalizarExecucaoUseCase(): FinalizarExecucaoUseCase {
        if (!this.finalizarExecucaoUseCase) {
            this.finalizarExecucaoUseCase = new FinalizarExecucaoUseCase(
                this.getExecucaoServicoGateway(),
                this.getOrdemServicoGateway(),
                this.getObservabilityPort()
            );
        }
        return this.finalizarExecucaoUseCase;
    }

    getListarExecucoesPorOrdemUseCase(): ListarExecucoesPorOrdemUseCase {
        if (!this.listarExecucoesPorOrdemUseCase) {
            this.listarExecucoesPorOrdemUseCase = new ListarExecucoesPorOrdemUseCase(
                this.getExecucaoServicoGateway()
            );
        }
        return this.listarExecucoesPorOrdemUseCase;
    }

    getObterTempoMedioServicosUseCase(): ObterTempoMedioServicosUseCase {
        if (!this.obterTempoMedioServicosUseCase) {
            this.obterTempoMedioServicosUseCase = new ObterTempoMedioServicosUseCase(
                this.getExecucaoServicoGateway()
            );
        }
        return this.obterTempoMedioServicosUseCase;
    }

    getPecaLookupPort(): IPecaLookupPort {
        if (!this.pecaLookupPort) {
            this.pecaLookupPort = new PecaLookupAdapter(this.getBuscarPecaPorIdUseCase());
        }
        return this.pecaLookupPort;
    }

    getServicoLookupPort(): IServicoLookupPort {
        if (!this.servicoLookupPort) {
            this.servicoLookupPort = new ServicoLookupAdapter(this.getBuscarServicoPorIdUseCase());
        }
        return this.servicoLookupPort;
    }

    getEstoqueMovimentacaoPort(): IEstoqueMovimentacaoPort {
        if (!this.estoqueMovimentacaoPort) {
            this.estoqueMovimentacaoPort = new EstoqueMovimentacaoAdapter(
                this.getBuscarEstoquePorPecaIdUseCase(),
                this.getRegistrarMovimentacaoEstoqueUseCase()
            );
        }
        return this.estoqueMovimentacaoPort;
    }

    getOrcamentoPort(): IOrcamentoPort {
        if (!this.orcamentoPort) {
            if (this.orcamentoPortInjected) {
                throw new Error('Orçamento port not injected.');
            }
            this.orcamentoPort = new OrcamentoPortAdapter(
                this.getCriarOrcamentoPendenteUseCase(),
                this.getVerificarUltimoOrcamentoAprovadoUseCase()
            );
        }
        return this.orcamentoPort;
    }

    getCriarOrcamentoPendenteUseCase(): CriarOrcamentoPendenteUseCase {
        if (!this.criarOrcamentoPendenteUseCase) {
            this.criarOrcamentoPendenteUseCase = new CriarOrcamentoPendenteUseCase(
                this.getOrcamentoGateway(),
                this.getEmailPort(),
                this.getObservabilityPort()
            );
        }
        return this.criarOrcamentoPendenteUseCase;
    }

    getAtualizarOrcamentoUseCase(): AtualizarOrcamentoUseCase {
        if (!this.atualizarOrcamentoUseCase) {
            this.atualizarOrcamentoUseCase = new AtualizarOrcamentoUseCase(
                this.getOrcamentoGateway(),
                this.getObservabilityPort()
            );
        }
        return this.atualizarOrcamentoUseCase;
    }

    getListarOrcamentosPorOrdemUseCase(): ListarOrcamentosPorOrdemUseCase {
        if (!this.listarOrcamentosPorOrdemUseCase) {
            this.listarOrcamentosPorOrdemUseCase = new ListarOrcamentosPorOrdemUseCase(
                this.getOrcamentoGateway()
            );
        }
        return this.listarOrcamentosPorOrdemUseCase;
    }

    getVerificarUltimoOrcamentoAprovadoUseCase(): VerificarUltimoOrcamentoAprovadoUseCase {
        if (!this.verificarUltimoOrcamentoAprovadoUseCase) {
            this.verificarUltimoOrcamentoAprovadoUseCase = new VerificarUltimoOrcamentoAprovadoUseCase(
                this.getOrcamentoGateway()
            );
        }
        return this.verificarUltimoOrcamentoAprovadoUseCase;
    }

    getAlterarStatusOrdemServicoUseCase(): AlterarStatusOrdemServicoUseCase {
        if (!this.alterarStatusOrdemServicoUseCase) {
            this.alterarStatusOrdemServicoUseCase = new AlterarStatusOrdemServicoUseCase(
                this.getOrcamentoPort(),
                this.getEstoqueMovimentacaoPort(),
                this.getObservabilityPort()
            );
        }
        return this.alterarStatusOrdemServicoUseCase;
    }

    getAtualizarItensOrdemServicoUseCase(): AtualizarItensOrdemServicoUseCase {
        if (!this.atualizarItensOrdemServicoUseCase) {
            this.atualizarItensOrdemServicoUseCase = new AtualizarItensOrdemServicoUseCase(
                this.getPecaLookupPort(),
                this.getServicoLookupPort(),
                this.getEstoqueMovimentacaoPort(),
                this.getOrcamentoPort(),
                this.getObservabilityPort()
            );
        }
        return this.atualizarItensOrdemServicoUseCase;
    }

    getAtualizarOrdemServicoUseCase(): AtualizarOrdemServicoUseCase {
        if (!this.atualizarOrdemServicoUseCase) {
            this.atualizarOrdemServicoUseCase = new AtualizarOrdemServicoUseCase(
                this.getOrdemServicoGateway(),
                this.getClienteLookupPort(),
                this.getVeiculoLookupPort(),
                this.getExecucaoServicoPort(),
                this.getAlterarStatusOrdemServicoUseCase(),
                this.getAtualizarItensOrdemServicoUseCase()
            );
        }
        return this.atualizarOrdemServicoUseCase;
    }

    getObterDetalhesOrdemServicoUseCase(): ObterDetalhesOrdemServicoUseCase {
        if (!this.obterDetalhesOrdemServicoUseCase) {
            this.obterDetalhesOrdemServicoUseCase = new ObterDetalhesOrdemServicoUseCase(
                this.getBuscarVeiculoPorIdUseCase(),
                this.getPecaLookupPort(),
                this.getServicoLookupPort()
            );
        }
        return this.obterDetalhesOrdemServicoUseCase;
    }

    getBuscarOrdensPorCpfCnpjUseCase(): BuscarOrdensPorCpfCnpjUseCase {
        if (!this.buscarOrdensPorCpfCnpjUseCase) {
            this.buscarOrdensPorCpfCnpjUseCase = new BuscarOrdensPorCpfCnpjUseCase(
                this.getOrdemServicoGateway(),
                this.getObterDetalhesOrdemServicoUseCase()
            );
        }
        return this.buscarOrdensPorCpfCnpjUseCase;
    }

    getCriarOrdemServicoUseCase(): CriarOrdemServicoUseCase {
        if (!this.criarOrdemServicoUseCase) {
            this.criarOrdemServicoUseCase = new CriarOrdemServicoUseCase(
                this.getOrdemServicoGateway(),
                this.getClienteLookupPort(),
                this.getVeiculoLookupPort(),
                this.getExecucaoServicoPort(),
                this.getObservabilityPort()
            );
        }
        return this.criarOrdemServicoUseCase;
    }

    getListarOrdensServicoUseCase(): ListarOrdensServicoUseCase {
        if (!this.listarOrdensServicoUseCase) {
            this.listarOrdensServicoUseCase = new ListarOrdensServicoUseCase(
                this.getOrdemServicoGateway()
            );
        }
        return this.listarOrdensServicoUseCase;
    }

    getBuscarOrdemServicoPorIdUseCase(): BuscarOrdemServicoPorIdUseCase {
        if (!this.buscarOrdemServicoPorIdUseCase) {
            this.buscarOrdemServicoPorIdUseCase = new BuscarOrdemServicoPorIdUseCase(
                this.getOrdemServicoGateway()
            );
        }
        return this.buscarOrdemServicoPorIdUseCase;
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

    getEstoquePresenter(): EstoquePresenter {
        if (!this.estoquePresenter) {
            this.estoquePresenter = new EstoquePresenter();
        }
        return this.estoquePresenter;
    }

    getOrdemServicoPresenter(): OrdemServicoPresenter {
        if (!this.ordemServicoPresenter) {
            this.ordemServicoPresenter = new OrdemServicoPresenter();
        }
        return this.ordemServicoPresenter;
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

    getEstoqueController(): EstoqueController {
        if (!this.estoqueController) {
            this.estoqueController = new EstoqueController(
                this.getListarEstoqueUseCase(),
                this.getBuscarEstoquePorPecaIdUseCase(),
                this.getRegistrarMovimentacaoEstoqueUseCase(),
                this.getListarMovimentacoesEstoqueUseCase(),
                this.getEstoquePresenter()
            );
        }
        return this.estoqueController;
    }

    getOrdemServicoController(): OrdemServicoController {
        if (!this.ordemServicoController) {
            this.ordemServicoController = new OrdemServicoController(
                () => this.getCriarOrdemServicoUseCase(),
                () => this.getListarOrdensServicoUseCase(),
                () => this.getBuscarOrdemServicoPorIdUseCase(),
                () => this.getAtualizarOrdemServicoUseCase(),
                () => this.getBuscarOrdensPorCpfCnpjUseCase(),
                () => this.getOrdemServicoPresenter()
            );
        }
        return this.ordemServicoController;
    }

    getExecucaoServicoPresenter(): ExecucaoServicoPresenter {
        if (!this.execucaoServicoPresenter) {
            this.execucaoServicoPresenter = new ExecucaoServicoPresenter();
        }
        return this.execucaoServicoPresenter;
    }

    getExecucaoServicoController(): ExecucaoServicoController {
        if (!this.execucaoServicoController) {
            this.execucaoServicoController = new ExecucaoServicoController(
                () => this.getListarExecucoesPorOrdemUseCase(),
                () => this.getIniciarExecucaoUseCase(),
                () => this.getFinalizarExecucaoUseCase(),
                () => this.getObterTempoMedioServicosUseCase(),
                () => this.getExecucaoServicoPresenter()
            );
        }
        return this.execucaoServicoController;
    }

    getOrcamentoPresenter(): OrcamentoPresenter {
        if (!this.orcamentoPresenter) {
            this.orcamentoPresenter = new OrcamentoPresenter();
        }
        return this.orcamentoPresenter;
    }

    getOrcamentoController(): OrcamentoController {
        if (!this.orcamentoController) {
            this.orcamentoController = new OrcamentoController(
                () => this.getAtualizarOrcamentoUseCase(),
                () => this.getListarOrcamentosPorOrdemUseCase(),
                () => this.getOrcamentoPresenter()
            );
        }
        return this.orcamentoController;
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

    injectEstoqueGateway(gateway: IEstoqueGateway): void {
        this.estoqueGateway = gateway;
        this.estoqueGatewayInjected = true;
        this.initialized = true;
        this.resetEstoqueCache();
    }

    injectMovimentacaoEstoqueGateway(gateway: IMovimentacaoEstoqueGateway): void {
        this.movimentacaoEstoqueGateway = gateway;
        this.movimentacaoEstoqueGatewayInjected = true;
        this.initialized = true;
        this.resetEstoqueCache();
    }

    injectOrdemServicoGateway(gateway: IOrdemServicoGateway): void {
        this.ordemServicoGateway = gateway;
        this.ordemServicoGatewayInjected = true;
        this.initialized = true;
        this.resetOrdemServicoCache();
        this.resetExecucaoServicoCache();
    }

    injectExecucaoServicoGateway(gateway: IExecucaoServicoGateway): void {
        this.execucaoServicoGateway = gateway;
        this.execucaoServicoGatewayInjected = true;
        this.initialized = true;
        this.resetExecucaoServicoCache();
        this.resetOrdemServicoCache();
    }

    injectExecucaoServicoPort(port: IExecucaoServicoPort): void {
        this.execucaoServicoPort = port;
        this.execucaoServicoPortInjected = true;
        this.initialized = true;
        this.resetExecucaoServicoCache();
        this.resetOrdemServicoCache();
    }

    injectOrcamentoGateway(gateway: IOrcamentoGateway): void {
        this.orcamentoGateway = gateway;
        this.orcamentoGatewayInjected = true;
        this.initialized = true;
        this.resetOrcamentoCache();
        this.resetOrdemServicoCache();
    }

    injectOrcamentoPort(port: IOrcamentoPort): void {
        this.orcamentoPort = port;
        this.orcamentoPortInjected = true;
        this.initialized = true;
        this.resetOrcamentoCache();
        this.resetOrdemServicoCache();
    }

    injectTokenPort(port: ITokenPort): void {
        this.tokenPort = port;
        this.tokenPortInjected = true;
        this.resetAuthCache();
    }

    injectCredentialsPort(port: ICredentialsPort): void {
        this.credentialsPort = port;
        this.credentialsPortInjected = true;
        this.resetAuthCache();
    }

    injectEmailPort(port: IEmailPort): void {
        this.emailPort = port;
        this.emailPortInjected = true;
        this.resetOrcamentoCache();
    }

    injectObservabilityPort(port: IObservabilityPort): void {
        this.observabilityPort = port;
        this.observabilityPortInjected = true;
        this.resetOrdemServicoCache();
        this.resetExecucaoServicoCache();
        this.resetOrcamentoCache();
    }

    reset(): void {
        this.clienteGateway = null;
        this.veiculoGateway = null;
        this.pecaGateway = null;
        this.servicoGateway = null;
        this.estoqueGateway = null;
        this.movimentacaoEstoqueGateway = null;
        this.ordemServicoGateway = null;
        this.execucaoServicoGateway = null;
        this.orcamentoGateway = null;
        this.clienteGatewayInjected = false;
        this.veiculoGatewayInjected = false;
        this.pecaGatewayInjected = false;
        this.servicoGatewayInjected = false;
        this.estoqueGatewayInjected = false;
        this.movimentacaoEstoqueGatewayInjected = false;
        this.ordemServicoGatewayInjected = false;
        this.execucaoServicoGatewayInjected = false;
        this.orcamentoGatewayInjected = false;
        this.clientePresenter = null;
        this.veiculoPresenter = null;
        this.pecaPresenter = null;
        this.servicoPresenter = null;
        this.estoquePresenter = null;
        this.clienteController = null;
        this.veiculoController = null;
        this.pecaController = null;
        this.servicoController = null;
        this.estoqueController = null;
        this.ordemServicoController = null;
        this.execucaoServicoController = null;
        this.orcamentoController = null;
        this.authController = null;
        this.execucaoServicoPortInjected = false;
        this.execucaoServicoPort = null;
        this.orcamentoPortInjected = false;
        this.orcamentoPort = null;
        this.tokenPortInjected = false;
        this.credentialsPortInjected = false;
        this.emailPortInjected = false;
        this.observabilityPortInjected = false;
        this.tokenPort = null;
        this.credentialsPort = null;
        this.emailPort = null;
        this.observabilityPort = null;
        this.resetClienteCache();
        this.resetVeiculoCache();
        this.resetPecaCache();
        this.resetServicoCache();
        this.resetEstoqueCache();
        this.resetOrdemServicoCache();
        this.resetExecucaoServicoCache();
        this.resetOrcamentoCache();
        this.resetAuthCache();
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
    }

    private resetVeiculoCache(): void {
        this.criarVeiculoUseCase = null;
        this.listarVeiculosUseCase = null;
        this.buscarVeiculoPorIdUseCase = null;
        this.atualizarVeiculoUseCase = null;
        this.deletarVeiculoUseCase = null;
        this.veiculoController = null;
    }

    private resetPecaCache(): void {
        this.criarPecaUseCase = null;
        this.listarPecasUseCase = null;
        this.buscarPecaPorIdUseCase = null;
        this.atualizarPecaUseCase = null;
        this.deletarPecaUseCase = null;
        this.pecaController = null;
    }

    private resetServicoCache(): void {
        this.criarServicoUseCase = null;
        this.listarServicosUseCase = null;
        this.buscarServicoPorIdUseCase = null;
        this.atualizarServicoUseCase = null;
        this.deletarServicoUseCase = null;
        this.servicoController = null;
    }

    private resetEstoqueCache(): void {
        this.registrarMovimentacaoEstoqueUseCase = null;
        this.listarEstoqueUseCase = null;
        this.buscarEstoquePorPecaIdUseCase = null;
        this.listarMovimentacoesEstoqueUseCase = null;
        this.estoqueController = null;
    }

    private resetOrdemServicoCache(): void {
        this.criarOrdemServicoUseCase = null;
        this.listarOrdensServicoUseCase = null;
        this.buscarOrdemServicoPorIdUseCase = null;
        this.alterarStatusOrdemServicoUseCase = null;
        this.atualizarItensOrdemServicoUseCase = null;
        this.atualizarOrdemServicoUseCase = null;
        this.obterDetalhesOrdemServicoUseCase = null;
        this.buscarOrdensPorCpfCnpjUseCase = null;
        this.clienteLookupPort = null;
        this.veiculoLookupPort = null;
        if (!this.execucaoServicoPortInjected) {
            this.execucaoServicoPort = null;
        }
        this.pecaLookupPort = null;
        this.servicoLookupPort = null;
        this.estoqueMovimentacaoPort = null;
        if (!this.orcamentoPortInjected) {
            this.orcamentoPort = null;
        }
        this.ordemServicoPresenter = null;
        this.ordemServicoController = null;
    }

    private resetOrcamentoCache(): void {
        this.criarOrcamentoPendenteUseCase = null;
        this.atualizarOrcamentoUseCase = null;
        this.listarOrcamentosPorOrdemUseCase = null;
        this.verificarUltimoOrcamentoAprovadoUseCase = null;
        this.orcamentoPresenter = null;
        this.orcamentoController = null;
        if (!this.orcamentoPortInjected) {
            this.orcamentoPort = null;
        }
        if (!this.emailPortInjected) {
            this.emailPort = null;
        }
    }

    private resetExecucaoServicoCache(): void {
        this.criarExecucoesParaServicosUseCase = null;
        this.iniciarExecucaoUseCase = null;
        this.finalizarExecucaoUseCase = null;
        this.listarExecucoesPorOrdemUseCase = null;
        this.obterTempoMedioServicosUseCase = null;
        this.execucaoServicoPresenter = null;
        this.execucaoServicoController = null;
        if (!this.execucaoServicoPortInjected) {
            this.execucaoServicoPort = null;
        }
    }

    private resetAuthCache(): void {
        this.autenticarUsuarioUseCase = null;
        this.verificarTokenUseCase = null;
        this.authController = null;
        if (!this.tokenPortInjected) {
            this.tokenPort = null;
        }
        if (!this.credentialsPortInjected) {
            this.credentialsPort = null;
        }
    }
}

export function getDIContainer(): DIContainer {
    return DIContainer.getInstance();
}
