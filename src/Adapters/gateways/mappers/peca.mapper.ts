import { Peca } from '../../../enterprise/entities/peca.entity';
import { TipoItem } from '../../../validators/tipo-item';

export interface PecaPersistenceModel {
    _id?: { toString(): string };
    nome: string;
    descricao: string;
    tipo: string;
    preco: number;
    quantidade?: number;
}

export class PecaMapper {
    static toPersistence(peca: Peca): Omit<PecaPersistenceModel, '_id'> {
        return {
            nome: peca.nome,
            descricao: peca.descricao,
            tipo: peca.tipo,
            preco: peca.preco,
            quantidade: peca.quantidade,
        };
    }

    static toDomain(raw: PecaPersistenceModel): Peca {
        const id = raw._id?.toString();
        const normalizedTipo = raw.tipo.toUpperCase();

        return new Peca(
            raw.nome,
            raw.descricao,
            raw.preco,
            normalizedTipo as TipoItem,
            id,
            raw.quantidade
        );
    }
}
