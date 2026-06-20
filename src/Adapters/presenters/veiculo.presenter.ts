import { VeiculoResponseDto } from '../../application/dtos/veiculo/veiculo.dtos';
import { Veiculo } from '../../enterprise/entities/veiculo.entity';

export class VeiculoPresenter {
    present(veiculo: Veiculo): VeiculoResponseDto {
        return {
            id: veiculo.id,
            placa: veiculo.placa.value,
            modelo: veiculo.modelo,
            ano: veiculo.ano,
            marca: veiculo.marca,
        };
    }

    presentList(veiculos: Veiculo[]): VeiculoResponseDto[] {
        return veiculos.map((veiculo) => this.present(veiculo));
    }
}
