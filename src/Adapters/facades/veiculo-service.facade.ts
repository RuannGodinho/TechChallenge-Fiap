import { CreateVeiculoInputDto, UpdateVeiculoInputDto } from '../../application/dtos/veiculo/veiculo.dtos';
import { Veiculo } from '../../enterprise/entities/veiculo.entity';
import { IVeiculoService } from '../../Interfaces/Veiculo/veiculo-service.interface';
import { CriarVeiculoUseCase } from '../../application/usecases/veiculo/criar-veiculo.usecase';
import { ListarVeiculosUseCase } from '../../application/usecases/veiculo/listar-veiculos.usecase';
import { BuscarVeiculoPorIdUseCase } from '../../application/usecases/veiculo/buscar-veiculo-por-id.usecase';
import { AtualizarVeiculoUseCase } from '../../application/usecases/veiculo/atualizar-veiculo.usecase';
import { DeletarVeiculoUseCase } from '../../application/usecases/veiculo/deletar-veiculo.usecase';

export class VeiculoServiceFacade implements IVeiculoService {
    constructor(
        private readonly listarVeiculosUseCase: ListarVeiculosUseCase,
        private readonly buscarVeiculoPorIdUseCase: BuscarVeiculoPorIdUseCase,
        private readonly criarVeiculoUseCase: CriarVeiculoUseCase,
        private readonly atualizarVeiculoUseCase: AtualizarVeiculoUseCase,
        private readonly deletarVeiculoUseCase: DeletarVeiculoUseCase
    ) {}

    async getAllVeiculos(): Promise<Veiculo[]> {
        return this.listarVeiculosUseCase.execute();
    }

    async getVeiculoById(id: string): Promise<Veiculo | null> {
        return this.buscarVeiculoPorIdUseCase.execute(id);
    }

    async criarVeiculo(veiculoData: CreateVeiculoInputDto): Promise<Veiculo> {
        return this.criarVeiculoUseCase.execute(veiculoData);
    }

    async atualizarVeiculo(
        id: string,
        veiculoData: UpdateVeiculoInputDto
    ): Promise<Veiculo | null> {
        return this.atualizarVeiculoUseCase.execute(id, veiculoData);
    }

    async deletarVeiculo(id: string): Promise<boolean> {
        return this.deletarVeiculoUseCase.execute(id);
    }
}
