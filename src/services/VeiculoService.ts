import { Veiculo } from '../Entities/Veiculo';
import { IVeiculoRepository } from '../Interfaces/Veiculo/IVeiculoRepository';
import { IVeiculoService } from '../Interfaces/Veiculo/IVeiculoService';
import { PlacaValidator } from '../validators/PlacaValidator';

export class VeiculoService implements IVeiculoService {
    constructor(private repo: IVeiculoRepository) {}

    async getAllVeiculos(): Promise<Veiculo[]> {
        return await this.repo.getAllVeiculos();
    }

    async getVeiculoById(id: string): Promise<Veiculo | null> {
        return await this.repo.getVeiculoById(id);
    }

    async criarVeiculo(veiculoData: Omit<Veiculo, 'id'>): Promise<Veiculo> {
        const veiculo = new Veiculo(veiculoData.Placa, veiculoData.Modelo, veiculoData.Ano, veiculoData.Marca);

        if (!PlacaValidator.isValid(veiculo.Placa)) 
            throw new Error("Placa inválida");
        
        await this.repo.criarVeiculo(veiculo);
        return veiculo;
    }

    async atualizarVeiculo(id: string, veiculoData: Partial<Veiculo>): Promise<Veiculo | null> {
        const existing = await this.repo.getVeiculoById(id);
        if (!existing) return null;

        const updated = { ...existing, ...veiculoData };

        if(veiculoData.Placa && !PlacaValidator.isValid(veiculoData.Placa)) 
            throw new Error("Placa inválida");
        
        await this.repo.atualizarVeiculo(id, updated);
        return updated;
    }

    async deletarVeiculo(id: string): Promise<boolean> {
        const existing = await this.repo.getVeiculoById(id);
        if (!existing) return false;

        await this.repo.deletarVeiculo(id);
        return true;
    }
}