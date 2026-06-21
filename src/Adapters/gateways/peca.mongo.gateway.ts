import { Db, ObjectId } from 'mongodb';
import { Peca } from '../../enterprise/entities/peca.entity';
import { IPecaGateway } from '../../application/ports/peca.gateway.port';
import { PecaMapper, PecaPersistenceModel } from './mappers/peca.mapper';

export class PecaMongoGateway implements IPecaGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<PecaPersistenceModel>('Pecas');
    }

    async findAll(): Promise<Peca[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => PecaMapper.toDomain(row));
    }

    async findById(id: string): Promise<Peca | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? PecaMapper.toDomain(row) : null;
    }

    async save(peca: Peca): Promise<Peca> {
        const persistence = PecaMapper.toPersistence(peca);
        const result = await this.collection.insertOne(persistence);
        return new Peca(
            peca.nome,
            peca.descricao,
            peca.preco,
            peca.tipo,
            result.insertedId.toString(),
            peca.quantidade
        );
    }

    async update(id: string, peca: Peca): Promise<Peca | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const persistence = PecaMapper.toPersistence(peca);
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: persistence },
            { returnDocument: 'after' }
        );

        return result ? PecaMapper.toDomain(result) : null;
    }

    async delete(id: string): Promise<boolean> {
        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount === 1;
    }
}
