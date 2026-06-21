import { MovimentacaoEstoque } from '../../../enterprise/entities/movimentacao-estoque.entity';
import { PecaId } from '../../../enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../../enterprise/value-objects/quantidade.vo';
import { TipoMovimentacao } from '../../../enterprise/value-objects/tipo-movimentacao.vo';
import { OrigemMovimentacao } from '../../../enterprise/value-objects/origem-movimentacao.vo';

export interface MovimentacaoEstoquePersistenceModel {
    _id?: { toString(): string };
    pecaId: { toString(): string } | string;
    tipo: string;
    quantidade: number;
    data: Date;
    origem: string;
}

export class MovimentacaoEstoqueMapper {
    static toPersistence(
        movimentacao: MovimentacaoEstoque
    ): Omit<MovimentacaoEstoquePersistenceModel, '_id'> {
        return {
            pecaId: movimentacao.pecaId.value,
            tipo: movimentacao.tipo.value,
            quantidade: movimentacao.quantidade.value,
            data: movimentacao.data,
            origem: movimentacao.origem.value,
        };
    }

    static toDomain(raw: MovimentacaoEstoquePersistenceModel): MovimentacaoEstoque {
        const id = raw._id?.toString();
        const pecaId =
            typeof raw.pecaId === 'string' ? raw.pecaId : raw.pecaId.toString();

        return new MovimentacaoEstoque(
            PecaId.from(pecaId),
            TipoMovimentacao.from(raw.tipo),
            Quantidade.from(raw.quantidade),
            raw.data,
            OrigemMovimentacao.from(raw.origem),
            id
        );
    }
}
