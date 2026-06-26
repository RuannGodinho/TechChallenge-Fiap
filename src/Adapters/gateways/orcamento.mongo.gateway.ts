import { Db, ObjectId } from 'mongodb';
import { Orcamento } from '../../enterprise/entities/orcamento.entity';
import { IOrcamentoGateway } from '../../application/ports/orcamento.gateway.port';
import {
    OrcamentoMapper,
    OrcamentoPersistenceModel,
} from './mappers/orcamento.mapper';

export class OrcamentoMongoGateway implements IOrcamentoGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<OrcamentoPersistenceModel>('Orcamento');
    }

    async save(orcamento: Orcamento): Promise<Orcamento> {
        const persistence = OrcamentoMapper.toPersistence(orcamento);
        const result = await this.collection.insertOne(persistence as OrcamentoPersistenceModel);

        return Orcamento.restore({
            id: result.insertedId.toString(),
            ordemServicoId: orcamento.ordemServicoId,
            versao: orcamento.versao,
            status: orcamento.status.value,
            pecas: orcamento.pecas,
            itensServicos: orcamento.itensServicos,
            valorTotal: orcamento.valorTotal,
            validadeEm: orcamento.validadeEm,
            criadoEm: orcamento.criadoEm,
        });
    }

    async findById(id: string): Promise<Orcamento | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? OrcamentoMapper.toDomain(row) : null;
    }

    async findByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
        if (!ObjectId.isValid(ordemServicoId)) {
            return [];
        }

        const rows = await this.collection
            .find({ ordemServicoId: new ObjectId(ordemServicoId) })
            .toArray();

        return rows.map((row) => OrcamentoMapper.toDomain(row));
    }

    async update(id: string, orcamento: Orcamento): Promise<Orcamento | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const persistence = OrcamentoMapper.toPersistence(orcamento);
        const { ordemServicoId: _ordemServicoId, criadoEm: _criadoEm, ...updates } = persistence;

        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        return result ? OrcamentoMapper.toDomain(result) : null;
    }
}
