import { Orcamento } from "../Entities/orcamento";
import { IOrcamentoRepository } from "../Interfaces/Orcamento/orcamento-repository.interface";
import { IOrcamentoService } from "../Interfaces/Orcamento/orcamento-service.interface";
import { StatusOrcamento } from "../validators/status-orcamento";

export class OrcamentoService implements IOrcamentoService {
    constructor(private repo: IOrcamentoRepository) {}

    async createOrcamento(orcamento: Orcamento): Promise<Orcamento> {
        // Validações se necessário
        await this.repo.createOrcamento(orcamento);
        return orcamento;
    }

    async updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null> {

        const tiposValidos = [StatusOrcamento.PENDENTE, StatusOrcamento.APROVADO, StatusOrcamento.REPROVADO, StatusOrcamento.EXPIRADO];

        if (updates.status &&!tiposValidos.includes(updates.status.toUpperCase() as any)) 
            throw new Error("Status inválido. Use PENDENTE, APROVADO, REPROVADO ou EXPIRADO");

        // Validações se necessário
        const existing = await this.repo.getOrcamentoById(id);

        if (!existing) return null;

        const updated = { ...existing, ...updates };

        await this.repo.updateOrcamento(id, updated);

        return  updated;
    }

    async getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
        return await this.repo.getOrcamentosByOrdemServicoId(ordemServicoId);
    }
}