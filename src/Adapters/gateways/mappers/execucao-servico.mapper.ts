import { ObjectId } from 'mongodb';
import { ExecucaoServico } from '../../../enterprise/entities/execucao-servico.entity';

export interface ExecucaoServicoPersistenceModel {
    _id?: { toString(): string };
    ordemServicoId: { toString(): string } | string;
    servicoId: { toString(): string } | string;
    status: string;
    criadoEm: Date;
    iniciadoEm?: Date;
    finalizadoEm?: Date;
}

export class ExecucaoServicoMapper {
    static toPersistence(
        execucao: ExecucaoServico
    ): Omit<ExecucaoServicoPersistenceModel, '_id'> {
        const persistence: Omit<ExecucaoServicoPersistenceModel, '_id'> = {
            ordemServicoId: new ObjectId(execucao.ordemServicoId),
            servicoId: new ObjectId(execucao.servicoId),
            status: execucao.status.value,
            criadoEm: execucao.criadoEm,
        };

        if (execucao.iniciadoEm) {
            persistence.iniciadoEm = execucao.iniciadoEm;
        }

        if (execucao.finalizadoEm) {
            persistence.finalizadoEm = execucao.finalizadoEm;
        }

        return persistence;
    }

    static toDomain(raw: ExecucaoServicoPersistenceModel): ExecucaoServico {
        const id = raw._id?.toString();
        const ordemServicoId =
            typeof raw.ordemServicoId === 'string'
                ? raw.ordemServicoId
                : raw.ordemServicoId.toString();
        const servicoId =
            typeof raw.servicoId === 'string' ? raw.servicoId : raw.servicoId.toString();

        return ExecucaoServico.restore({
            id,
            ordemServicoId,
            servicoId,
            status: raw.status,
            criadoEm: raw.criadoEm,
            iniciadoEm: raw.iniciadoEm,
            finalizadoEm: raw.finalizadoEm,
        });
    }
}
