import { connectDatabase } from '../infrastructure/database';
import { Servico } from '../enterprise/entities/servico.entity';
import { ServicoMongoGateway } from '../Adapters/gateways/servico.mongo.gateway';
import { IServicoRepository } from '../Interfaces/Servico/servico-repository.interface';

export class ServicoRepository implements IServicoRepository {
    private gateway: ServicoMongoGateway | null = null;

    private async getGateway(): Promise<ServicoMongoGateway> {
        if (!this.gateway) {
            const db = await connectDatabase();
            this.gateway = new ServicoMongoGateway(db);
        }
        return this.gateway;
    }

    async getAllServicos(): Promise<Servico[]> {
        return (await this.getGateway()).findAll();
    }

    async getServicoById(id: string): Promise<Servico | null> {
        return (await this.getGateway()).findById(id);
    }

    async createServico(servico: Servico): Promise<void> {
        await (await this.getGateway()).save(servico);
    }

    async updateServico(id: string, servico: Servico): Promise<void> {
        await (await this.getGateway()).update(id, servico);
    }

    async deleteServico(id: string): Promise<void> {
        await (await this.getGateway()).delete(id);
    }
}

export { ServicoMongoGateway } from '../Adapters/gateways/servico.mongo.gateway';
