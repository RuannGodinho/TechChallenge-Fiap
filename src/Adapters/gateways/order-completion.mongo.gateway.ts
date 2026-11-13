import { Db, ObjectId } from 'mongodb';
import { OrderCompletionRepository } from '../../application/ports/order-completion.port';
import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';
import { OrdemServicoMapper, OrdemServicoPersistenceModel } from './mappers/ordem-servico.mapper';

export class OrderCompletionMongoGateway implements OrderCompletionRepository {
    private readonly collection;
    constructor(db: Db) { this.collection = db.collection<OrdemServicoPersistenceModel>('OrdemServico'); }
    async findById(id: string) {
        if (!ObjectId.isValid(id)) return null;
        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? OrdemServicoMapper.toDomain(row) : null;
    }
    async saveTransition(id: string, expectedStatus: string, order: OrdemServico) {
        const entry = order.statusHistory[order.statusHistory.length - 1];
        const row = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id), status: expectedStatus },
            { $set: { status: order.status.value, statusEnteredAt: order.statusEnteredAt }, $push: { statusHistory: entry } } as never,
            { returnDocument: 'after' },
        );
        return row ? OrdemServicoMapper.toDomain(row) : null;
    }
}
