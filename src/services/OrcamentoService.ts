import { ObjectId } from "mongodb";
import { Orcamento } from "../Entities/Orcamento";
import { IOrcamentoRepository } from "../Interfaces/Orcamento/IOrcamentoRepository";
import { IOrcamentoService } from "../Interfaces/Orcamento/IOrcamentoService";
import { StatusOrcamento } from "../validators/StatusOrcamento";

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
}