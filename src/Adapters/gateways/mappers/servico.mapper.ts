import { Servico } from '../../../enterprise/entities/servico.entity';

export interface ServicoPersistenceModel {
    _id?: { toString(): string };
    nome: string;
    descricao: string;
    preco: number;
    quantidade?: number;
}

export class ServicoMapper {
    static toPersistence(servico: Servico): Omit<ServicoPersistenceModel, '_id'> {
        const persistence: Omit<ServicoPersistenceModel, '_id'> = {
            nome: servico.nome,
            descricao: servico.descricao,
            preco: servico.preco,
        };

        if (servico.quantidade != null) {
            persistence.quantidade = servico.quantidade;
        }

        return persistence;
    }

    static toDomain(raw: ServicoPersistenceModel): Servico {
        const id = raw._id?.toString();
        return new Servico(raw.nome, raw.descricao, raw.preco, id, raw.quantidade ?? undefined);
    }
}
