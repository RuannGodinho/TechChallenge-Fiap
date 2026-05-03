import { Veiculo } from '../Entities/veiculo';
import { IVeiculoRepository } from '../Interfaces/Veiculo/veiculo-repository.interface';
import { IVeiculoService } from '../Interfaces/Veiculo/veiculo-service.interface';
import { PlacaValidator } from '../validators/placa-validator';

export class VeiculoService implements IVeiculoService {
    constructor(private repo: IVeiculoRepository) {}

    async getAllVeiculos(): Promise<Veiculo[]> {
        return await this.repo.getAllVeiculos();
    }

    async getVeiculoById(id: string): Promise<Veiculo | null> {
        return await this.repo.getVeiculoById(id);
    }

    async criarVeiculo(veiculoData: Omit<Veiculo, 'id'>): Promise<Veiculo> {
        const veiculo = new Veiculo(veiculoData.placa, veiculoData.modelo, veiculoData.ano, veiculoData.marca);

        if (!PlacaValidator.isValid(veiculo.placa)) 
            throw new Error("Placa inválida");
        
        await this.repo.criarVeiculo(veiculo);
        return veiculo;
    }

    async atualizarVeiculo(id: string, veiculoData: Partial<Veiculo>): Promise<Veiculo | null> {
        const existing = await this.repo.getVeiculoById(id);
        if (!existing) return null;

        const updated = { ...existing, ...veiculoData };

        if(veiculoData.placa && !PlacaValidator.isValid(veiculoData.placa)) 
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