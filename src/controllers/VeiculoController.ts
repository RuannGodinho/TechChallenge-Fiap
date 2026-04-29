import { Veiculo } from '../Entities/Veiculo';
import { IVeiculoService } from '../Interfaces/IVeiculoService';

export class VeiculoController {
    constructor(private service: IVeiculoService) {}

    async getAllVeiculos(): Promise<Veiculo[]> {
        return await this.service.getAllVeiculos();
    }

    async getVeiculoById(id: string): Promise<Veiculo | null> {
        return await this.service.getVeiculoById(id);
    }

    async criarVeiculo(veiculoData: Omit<Veiculo, 'id'>): Promise<Veiculo> {
        return await this.service.criarVeiculo(veiculoData);
    }

    async atualizarVeiculo(id: string, veiculoData: Partial<Veiculo>): Promise<Veiculo | null> {
        return await this.service.atualizarVeiculo(id, veiculoData);
    }

    async deletarVeiculo(id: string): Promise<boolean> {
        return await this.service.deletarVeiculo(id);
    }
}