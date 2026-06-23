import { Db, ObjectId } from 'mongodb';
import { ExecucaoServico } from '../../enterprise/entities/execucao-servico.entity';
import { IExecucaoServicoGateway } from '../../application/ports/execucao-servico.gateway.port';
import {
    ExecucaoServicoMapper,
    ExecucaoServicoPersistenceModel,
} from './mappers/execucao-servico.mapper';

export class ExecucaoServicoMongoGateway implements IExecucaoServicoGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<ExecucaoServicoPersistenceModel>('ExecucoesServico');
    }

    async save(execucao: ExecucaoServico): Promise<ExecucaoServico> {
        const persistence = ExecucaoServicoMapper.toPersistence(execucao);
        const result = await this.collection.insertOne(persistence as ExecucaoServicoPersistenceModel);

        return ExecucaoServico.restore({
            id: result.insertedId.toString(),
            ordemServicoId: execucao.ordemServicoId,
            servicoId: execucao.servicoId,
            status: execucao.status.value,
            criadoEm: execucao.criadoEm,
            iniciadoEm: execucao.iniciadoEm,
            finalizadoEm: execucao.finalizadoEm,
        });
    }

    async saveMany(execucoes: ExecucaoServico[]): Promise<void> {
        if (!execucoes.length) {
            return;
        }

        const rows = execucoes.map((execucao) =>
            ExecucaoServicoMapper.toPersistence(execucao)
        ) as ExecucaoServicoPersistenceModel[];

        await this.collection.insertMany(rows);
    }

    async findById(id: string): Promise<ExecucaoServico | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? ExecucaoServicoMapper.toDomain(row) : null;
    }

    async findByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]> {
        if (!ObjectId.isValid(ordemServicoId)) {
            return [];
        }

        const rows = await this.collection
            .find({ ordemServicoId: new ObjectId(ordemServicoId) })
            .toArray();

        return rows.map((row) => ExecucaoServicoMapper.toDomain(row));
    }

    async findFinalizadas(): Promise<ExecucaoServico[]> {
        const rows = await this.collection
            .find({
                status: 'FINALIZADO',
                iniciadoEm: { $exists: true },
                finalizadoEm: { $exists: true },
            } as Record<string, unknown>)
            .toArray();

        return rows.map((row) => ExecucaoServicoMapper.toDomain(row));
    }

    async update(id: string, execucao: Partial<ExecucaoServico>): Promise<ExecucaoServico | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const updates: Record<string, unknown> = {};

        if (execucao.status) {
            updates.status = execucao.status.value;
        }

        if (execucao.iniciadoEm) {
            updates.iniciadoEm = execucao.iniciadoEm;
        }

        if (execucao.finalizadoEm) {
            updates.finalizadoEm = execucao.finalizadoEm;
        }

        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        return result ? ExecucaoServicoMapper.toDomain(result) : null;
    }
}
