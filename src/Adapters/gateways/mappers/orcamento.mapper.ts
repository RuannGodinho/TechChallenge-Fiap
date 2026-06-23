import { ObjectId } from 'mongodb';
import { PecaPersistenceModel, PecaMapper } from './peca.mapper';
import { ServicoPersistenceModel, ServicoMapper } from './servico.mapper';
import { Orcamento } from '../../../enterprise/entities/orcamento.entity';

export interface OrcamentoPersistenceModel {
    _id?: ObjectId;
    ordemServicoId: ObjectId;
    versao: number;
    status: string;
    pecas: PecaPersistenceModel[];
    itensServicos: ServicoPersistenceModel[];
    valorTotal: number;
    validadeEm: Date;
    criadoEm: Date;
}

export class OrcamentoMapper {
    static toPersistence(orcamento: Orcamento): Omit<OrcamentoPersistenceModel, '_id'> {
        return {
            ordemServicoId: new ObjectId(orcamento.ordemServicoId),
            versao: orcamento.versao,
            status: orcamento.status.value,
            pecas: orcamento.pecas.map((peca) => PecaMapper.toPersistence(peca)) as PecaPersistenceModel[],
            itensServicos: orcamento.itensServicos.map((servico) =>
                ServicoMapper.toPersistence(servico)
            ) as ServicoPersistenceModel[],
            valorTotal: orcamento.valorTotal,
            validadeEm: orcamento.validadeEm,
            criadoEm: orcamento.criadoEm,
        };
    }

    static toDomain(raw: OrcamentoPersistenceModel): Orcamento {
        return Orcamento.restore({
            id: raw._id?.toString(),
            ordemServicoId: raw.ordemServicoId.toString(),
            versao: raw.versao,
            status: raw.status,
            pecas: (raw.pecas ?? []).map((peca) => OrcamentoMapper.mapEmbeddedPeca(peca)),
            itensServicos: (raw.itensServicos ?? []).map((servico) =>
                OrcamentoMapper.mapEmbeddedServico(servico)
            ),
            valorTotal: raw.valorTotal,
            validadeEm: raw.validadeEm,
            criadoEm: raw.criadoEm,
        });
    }

    private static mapEmbeddedPeca(raw: PecaPersistenceModel & { id?: string }): ReturnType<typeof PecaMapper.toDomain> {
        if (raw._id || raw.id) {
            return PecaMapper.toDomain({
                ...raw,
                _id: raw._id ?? { toString: () => raw.id! },
            });
        }

        return PecaMapper.toDomain(raw);
    }

    private static mapEmbeddedServico(
        raw: ServicoPersistenceModel & { id?: string }
    ): ReturnType<typeof ServicoMapper.toDomain> {
        if (raw._id || raw.id) {
            return ServicoMapper.toDomain({
                ...raw,
                _id: raw._id ?? { toString: () => raw.id! },
            });
        }

        return ServicoMapper.toDomain(raw);
    }
}
