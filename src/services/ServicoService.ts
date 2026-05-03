import { Servico } from '../Entities/Servico';
import { IServicoRepository } from '../Interfaces/Servico/IServicoRepository'
import { IServicoService } from '../Interfaces/Servico/IServicoService';

export class ServicoService implements IServicoService {
    constructor(private repo: IServicoRepository) {}

    async getAllServicos(): Promise<Servico[]> {
        return await this.repo.getAllServicos();
    }

    async getServicoById(id: string): Promise<Servico | null> {
        return await this.repo.getServicoById(id);
    }

    async createServico(ServicoData: Omit<Servico, 'id'>): Promise<Servico> {
        const servico = new Servico(ServicoData.nome, ServicoData.descricao, ServicoData.preco);
        await this.repo.createServico(servico);
        return servico;
    }

    async updateServico(id: string, ServicoData: Partial<Servico>): Promise<Servico | null> {
        const existing = await this.repo.getServicoById(id);
        if (!existing) return null;

        const updated = { ...existing, ...ServicoData };
        await this.repo.updateServico(id, updated);
        return updated;
    }

    async deleteServico(id: string): Promise<boolean> {
        const existing = await this.repo.getServicoById(id);
        if (!existing) return false;

        await this.repo.deleteServico(id);
        return true;
    }
}