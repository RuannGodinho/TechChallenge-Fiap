import { Veiculo } from '../../Entities/Veiculo';

export interface IVeiculoRepository {
    getAllVeiculos(): Promise<Veiculo[]>;
    getVeiculoById(id: string): Promise<Veiculo | null>;
    criarVeiculo(veiculo: Veiculo): Promise<void>;
    atualizarVeiculo(id: string, veiculo: Veiculo): Promise<void>;
    deletarVeiculo(id: string): Promise<void>;
}