import { Veiculo } from '../../../enterprise/entities/veiculo.entity';
import { Placa } from '../../../enterprise/value-objects/placa.vo';

export interface VeiculoPersistenceModel {
    _id?: { toString(): string };
    placa: string;
    modelo: string;
    ano: number;
    marca: string;
}

export class VeiculoMapper {
    static toPersistence(veiculo: Veiculo): Omit<VeiculoPersistenceModel, '_id'> {
        return {
            placa: veiculo.placa.value,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            marca: veiculo.marca,
        };
    }

    static toDomain(raw: VeiculoPersistenceModel): Veiculo {
        const id = raw._id?.toString();
        return new Veiculo(
            Placa.from(raw.placa),
            raw.modelo,
            raw.ano,
            raw.marca,
            id
        );
    }
}
