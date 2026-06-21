import { Estoque } from '../../../enterprise/entities/estoque.entity';
import { PecaId } from '../../../enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../../enterprise/value-objects/quantidade.vo';

export interface EstoquePersistenceModel {
    _id?: { toString(): string };
    pecaId: { toString(): string } | string;
    quantidade: number;
}

export class EstoqueMapper {
    static toPersistence(estoque: Estoque): Omit<EstoquePersistenceModel, '_id'> {
        return {
            pecaId: estoque.pecaId.value,
            quantidade: estoque.quantidade.value,
        };
    }

    static toDomain(raw: EstoquePersistenceModel): Estoque {
        const pecaId =
            typeof raw.pecaId === 'string' ? raw.pecaId : raw.pecaId.toString();

        return Estoque.restore(PecaId.from(pecaId), Quantidade.from(raw.quantidade));
    }
}
