import { Db, ObjectId } from 'mongodb';
import { Servico } from '../../enterprise/entities/servico.entity';
import { IServicoGateway } from '../../application/ports/servico.gateway.port';
import { ServicoMapper, ServicoPersistenceModel } from './mappers/servico.mapper';

export class ServicoMongoGateway implements IServicoGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<ServicoPersistenceModel>('Servicos');
    }

    async findAll(): Promise<Servico[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => ServicoMapper.toDomain(row));
    }

    async findById(id: string): Promise<Servico | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? ServicoMapper.toDomain(row) : null;
    }

    async save(servico: Servico): Promise<Servico> {
        const persistence = ServicoMapper.toPersistence(servico);
        const result = await this.collection.insertOne(persistence);
        return new Servico(
            servico.nome,
            servico.descricao,
            servico.preco,
            result.insertedId.toString(),
            servico.quantidade ?? undefined
        );
    }

    async update(id: string, servico: Servico): Promise<Servico | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const persistence = ServicoMapper.toPersistence(servico);
        const updateDoc: { $set: typeof persistence; $unset?: { quantidade: '' } } = {
            $set: persistence,
        };

        if (servico.quantidade == null) {
            updateDoc.$unset = { quantidade: '' };
        }

        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            updateDoc,
            { returnDocument: 'after' }
        );

        return result ? ServicoMapper.toDomain(result) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    }
}
