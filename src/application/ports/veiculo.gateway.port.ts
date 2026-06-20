import { Veiculo } from '../../enterprise/entities/veiculo.entity';
import { Placa } from '../../enterprise/value-objects/placa.vo';

export interface IVeiculoGateway {
    findAll(): Promise<Veiculo[]>;
    findById(id: string): Promise<Veiculo | null>;
    findByPlaca(placa: Placa): Promise<Veiculo | null>;
    save(veiculo: Veiculo): Promise<Veiculo>;
    update(id: string, veiculo: Veiculo): Promise<Veiculo | null>;
    delete(id: string): Promise<boolean>;
}
