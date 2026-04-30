import { Servico } from '../Entities/Servico';
import { IServicoService } from '../Interfaces/Servico/IServicoService';

export class ServicoController {
    constructor(private service: IServicoService) {}

    async getAllServicos(): Promise<Servico[]> {
        return await this.service.getAllServicos();
    }

    async getServicoById(id: string): Promise<Servico | null> {
        return await this.service.getServicoById(id);
    }

    async createServico(serviceData: Omit<Servico, 'id'>): Promise<Servico> {
        return await this.service.createServico(serviceData);
    }

    async updateServico(id: string, serviceData: Partial<Servico>): Promise<Servico | null> {
        return await this.service.updateServico(id, serviceData);
    }

    async deleteServico(id: string): Promise<boolean> {
        return await this.service.deleteServico(id);
    }
}