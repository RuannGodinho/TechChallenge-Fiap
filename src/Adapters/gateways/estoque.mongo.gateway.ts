import { Db, ObjectId } from 'mongodb';
import { Estoque } from '../../enterprise/entities/estoque.entity';
import { IEstoqueGateway } from '../../application/ports/estoque.gateway.port';
import { EstoqueMapper, EstoquePersistenceModel } from './mappers/estoque.mapper';

export class EstoqueMongoGateway implements IEstoqueGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection = this.db.collection<EstoquePersistenceModel>('Estoque');
    }

    async findAll(): Promise<Estoque[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => EstoqueMapper.toDomain(row));
    }

    async findByPecaId(pecaId: string): Promise<Estoque | null> {
        if (!ObjectId.isValid(pecaId)) {
            return null;
        }

        const row = await this.collection.findOne({ pecaId: new ObjectId(pecaId) });
        return row ? EstoqueMapper.toDomain(row) : null;
    }

    async save(estoque: Estoque): Promise<Estoque> {
        const persistence = EstoqueMapper.toPersistence(estoque);
        const pecaObjectId = new ObjectId(estoque.pecaId.value);
        const existing = await this.collection.findOne({ pecaId: pecaObjectId });

        if (existing) {
            await this.collection.updateOne(
                { pecaId: pecaObjectId },
                { $set: { quantidade: persistence.quantidade } }
            );
        } else {
            await this.collection.insertOne({
                ...persistence,
                pecaId: pecaObjectId,
            });
        }

        return Estoque.restore(estoque.pecaId, estoque.quantidade);
    }
}
