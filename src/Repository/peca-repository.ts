import { ObjectId } from 'mongodb';
import { connectDatabase } from '../infrastructure/database';
import { Peca } from '../enterprise/entities/peca.entity';
import { PecaMongoGateway } from '../Adapters/gateways/peca.mongo.gateway';
import { IPecaRepository } from '../Interfaces/Peca/peca-repository.interface';

export class PecaRepository implements IPecaRepository {
    private gateway: PecaMongoGateway | null = null;

    private async getGateway(): Promise<PecaMongoGateway> {
        if (!this.gateway) {
            const db = await connectDatabase();
            this.gateway = new PecaMongoGateway(db);
        }
        return this.gateway;
    }

    async getAllPecas(): Promise<Peca[]> {
        return (await this.getGateway()).findAll();
    }

    async getPecaById(id: ObjectId): Promise<Peca | null> {
        return (await this.getGateway()).findById(id.toString());
    }

    async createPeca(peca: Peca): Promise<void> {
        await (await this.getGateway()).save(peca);
    }

    async updatePeca(id: ObjectId, peca: Peca): Promise<void> {
        await (await this.getGateway()).update(id.toString(), peca);
    }

    async deletePeca(id: ObjectId): Promise<void> {
        await (await this.getGateway()).delete(id.toString());
    }
}

export { PecaMongoGateway } from '../Adapters/gateways/peca.mongo.gateway';
