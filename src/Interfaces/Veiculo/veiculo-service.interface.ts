import { Veiculo } from '../../enterprise/entities/veiculo.entity';

export interface IVeiculoService {
    getAllVeiculos(): Promise<Veiculo[]>;
    getVeiculoById(id: string): Promise<Veiculo | null>;
    criarVeiculo(veiculo: {
        placa: string;
        modelo: string;
        ano: number;
        marca: string;
    }): Promise<Veiculo>;
    atualizarVeiculo(id: string, veiculo: {
        placa?: string;
        modelo?: string;
        ano?: number;
        marca?: string;
    }): Promise<Veiculo | null>;
    deletarVeiculo(id: string): Promise<boolean>;
}
