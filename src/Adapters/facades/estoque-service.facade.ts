import { ObjectId } from 'mongodb';
import { Estoque } from '../../Entities/Estoque/estoque';
import { MovimentacaoEstoque } from '../../Entities/Estoque/movimentacao-estoque';
import { IEstoqueService } from '../../Interfaces/Estoque/estoque-service.interface';
import { RegistrarMovimentacaoEstoqueUseCase } from '../../application/usecases/estoque/registrar-movimentacao-estoque.usecase';
import { ListarEstoqueUseCase } from '../../application/usecases/estoque/listar-estoque.usecase';
import { BuscarEstoquePorPecaIdUseCase } from '../../application/usecases/estoque/buscar-estoque-por-peca-id.usecase';
import { ListarMovimentacoesEstoqueUseCase } from '../../application/usecases/estoque/listar-movimentacoes-estoque.usecase';
import { OrigemMovimentacaoValues } from '../../enterprise/value-objects/origem-movimentacao.vo';

export class EstoqueServiceFacade implements IEstoqueService {
    constructor(
        private readonly listarEstoqueUseCase: ListarEstoqueUseCase,
        private readonly buscarEstoquePorPecaIdUseCase: BuscarEstoquePorPecaIdUseCase,
        private readonly registrarMovimentacaoEstoqueUseCase: RegistrarMovimentacaoEstoqueUseCase,
        private readonly listarMovimentacoesEstoqueUseCase: ListarMovimentacoesEstoqueUseCase
    ) {}

    async getAllEstoque(): Promise<Estoque[]> {
        const items = await this.listarEstoqueUseCase.execute();
        return items.map(
            (item) => new Estoque(new ObjectId(item.pecaId.value), item.quantidade.value)
        );
    }

    async getEstoqueByPecaId(pecaId: ObjectId): Promise<Estoque | null> {
        const estoque = await this.buscarEstoquePorPecaIdUseCase.execute(pecaId.toString());

        if (!estoque) {
            return null;
        }

        return new Estoque(new ObjectId(estoque.pecaId.value), estoque.quantidade.value);
    }

    async createMovimentacao(movimentacao: MovimentacaoEstoque): Promise<MovimentacaoEstoque> {
        const saved = await this.registrarMovimentacaoEstoqueUseCase.execute({
            pecaId: movimentacao.pecaId.toString(),
            tipo: movimentacao.tipo,
            quantidade: movimentacao.quantidade,
            data: movimentacao.data,
            origem: movimentacao.origem ?? OrigemMovimentacaoValues.OS,
        });

        return new MovimentacaoEstoque(
            new ObjectId(saved.pecaId.value),
            saved.tipo.value,
            saved.quantidade.value,
            saved.data,
            saved.origem.value
        );
    }

    async listaMovimentacoes(): Promise<MovimentacaoEstoque[]> {
        const movimentacoes = await this.listarMovimentacoesEstoqueUseCase.execute();

        return movimentacoes.map(
            (item) =>
                new MovimentacaoEstoque(
                    new ObjectId(item.pecaId.value),
                    item.tipo.value,
                    item.quantidade.value,
                    item.data,
                    item.origem.value
                )
        );
    }
}
