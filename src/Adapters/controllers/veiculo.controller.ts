import {
    CreateVeiculoInputDto,
    UpdateVeiculoInputDto,
    VeiculoResponseDto,
} from '../../application/dtos/veiculo/veiculo.dtos';
import { CriarVeiculoUseCase } from '../../application/usecases/veiculo/criar-veiculo.usecase';
import { ListarVeiculosUseCase } from '../../application/usecases/veiculo/listar-veiculos.usecase';
import { BuscarVeiculoPorIdUseCase } from '../../application/usecases/veiculo/buscar-veiculo-por-id.usecase';
import { AtualizarVeiculoUseCase } from '../../application/usecases/veiculo/atualizar-veiculo.usecase';
import { DeletarVeiculoUseCase } from '../../application/usecases/veiculo/deletar-veiculo.usecase';
import { VeiculoPresenter } from '../presenters/veiculo.presenter';

export class VeiculoController {
    constructor(
        private readonly listarVeiculosUseCase: ListarVeiculosUseCase,
        private readonly buscarVeiculoPorIdUseCase: BuscarVeiculoPorIdUseCase,
        private readonly criarVeiculoUseCase: CriarVeiculoUseCase,
        private readonly atualizarVeiculoUseCase: AtualizarVeiculoUseCase,
        private readonly deletarVeiculoUseCase: DeletarVeiculoUseCase,
        private readonly presenter: VeiculoPresenter
    ) {}

    async getAllVeiculos(): Promise<VeiculoResponseDto[]> {
        const veiculos = await this.listarVeiculosUseCase.execute();
        return this.presenter.presentList(veiculos);
    }

    async getVeiculoById(id: string): Promise<VeiculoResponseDto | null> {
        const veiculo = await this.buscarVeiculoPorIdUseCase.execute(id);
        return veiculo ? this.presenter.present(veiculo) : null;
    }

    async criarVeiculo(input: CreateVeiculoInputDto): Promise<VeiculoResponseDto> {
        const veiculo = await this.criarVeiculoUseCase.execute(input);
        return this.presenter.present(veiculo);
    }

    async atualizarVeiculo(
        id: string,
        input: UpdateVeiculoInputDto
    ): Promise<VeiculoResponseDto | null> {
        const veiculo = await this.atualizarVeiculoUseCase.execute(id, input);
        return veiculo ? this.presenter.present(veiculo) : null;
    }

    async deletarVeiculo(id: string): Promise<boolean> {
        return this.deletarVeiculoUseCase.execute(id);
    }
}
