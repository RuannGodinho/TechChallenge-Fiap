import {
    EstoqueResponseDto,
    MovimentacaoEstoqueResponseDto,
    RegistrarMovimentacaoInputDto,
} from '../../application/dtos/estoque/estoque.dtos';
import { RegistrarMovimentacaoEstoqueUseCase } from '../../application/usecases/estoque/registrar-movimentacao-estoque.usecase';
import { ListarEstoqueUseCase } from '../../application/usecases/estoque/listar-estoque.usecase';
import { BuscarEstoquePorPecaIdUseCase } from '../../application/usecases/estoque/buscar-estoque-por-peca-id.usecase';
import { ListarMovimentacoesEstoqueUseCase } from '../../application/usecases/estoque/listar-movimentacoes-estoque.usecase';
import { EstoquePresenter } from '../presenters/estoque.presenter';

export class EstoqueController {
    constructor(
        private readonly listarEstoqueUseCase: ListarEstoqueUseCase,
        private readonly buscarEstoquePorPecaIdUseCase: BuscarEstoquePorPecaIdUseCase,
        private readonly registrarMovimentacaoEstoqueUseCase: RegistrarMovimentacaoEstoqueUseCase,
        private readonly listarMovimentacoesEstoqueUseCase: ListarMovimentacoesEstoqueUseCase,
        private readonly presenter: EstoquePresenter
    ) {}

    async getAllEstoque(): Promise<EstoqueResponseDto[]> {
        const estoque = await this.listarEstoqueUseCase.execute();
        return this.presenter.presentEstoqueList(estoque);
    }

    async getEstoqueByPecaId(pecaId: string): Promise<EstoqueResponseDto | null> {
        const estoque = await this.buscarEstoquePorPecaIdUseCase.execute(pecaId);
        return estoque ? this.presenter.presentEstoque(estoque) : null;
    }

    async createMovimentacao(
        input: RegistrarMovimentacaoInputDto
    ): Promise<MovimentacaoEstoqueResponseDto> {
        const movimentacao = await this.registrarMovimentacaoEstoqueUseCase.execute(input);
        return this.presenter.presentMovimentacao(movimentacao);
    }

    async listaMovimentacoes(): Promise<MovimentacaoEstoqueResponseDto[]> {
        const movimentacoes = await this.listarMovimentacoesEstoqueUseCase.execute();
        return this.presenter.presentMovimentacaoList(movimentacoes);
    }
}
