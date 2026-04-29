import { Veiculo } from '../Entities/Veiculo';

export interface IVeiculoService {
    getAllVeiculos(): Promise<Veiculo[]>;
    getVeiculoById(id: string): Promise<Veiculo | null>;
    criarVeiculo(veiculoData: Omit<Veiculo, 'id'>): Promise<Veiculo>;
    atualizarVeiculo(id: string, veiculoData: Partial<Veiculo>): Promise<Veiculo | null>;
    deletarVeiculo(id: string): Promise<boolean>;
}