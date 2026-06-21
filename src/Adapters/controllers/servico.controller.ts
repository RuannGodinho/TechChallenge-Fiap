import {
    CreateServicoInputDto,
    ServicoResponseDto,
    UpdateServicoInputDto,
} from '../../application/dtos/servico/servico.dtos';
import { CriarServicoUseCase } from '../../application/usecases/servico/criar-servico.usecase';
import { ListarServicosUseCase } from '../../application/usecases/servico/listar-servicos.usecase';
import { BuscarServicoPorIdUseCase } from '../../application/usecases/servico/buscar-servico-por-id.usecase';
import { AtualizarServicoUseCase } from '../../application/usecases/servico/atualizar-servico.usecase';
import { DeletarServicoUseCase } from '../../application/usecases/servico/deletar-servico.usecase';
import { ServicoPresenter } from '../presenters/servico.presenter';

export class ServicoController {
    constructor(
        private readonly listarServicosUseCase: ListarServicosUseCase,
        private readonly buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase,
        private readonly criarServicoUseCase: CriarServicoUseCase,
        private readonly atualizarServicoUseCase: AtualizarServicoUseCase,
        private readonly deletarServicoUseCase: DeletarServicoUseCase,
        private readonly presenter: ServicoPresenter
    ) {}

    async getAllServicos(): Promise<ServicoResponseDto[]> {
        const servicos = await this.listarServicosUseCase.execute();
        return this.presenter.presentList(servicos);
    }

    async getServicoById(id: string): Promise<ServicoResponseDto | null> {
        const servico = await this.buscarServicoPorIdUseCase.execute(id);
        return servico ? this.presenter.present(servico) : null;
    }

    async createServico(input: CreateServicoInputDto): Promise<ServicoResponseDto> {
        const servico = await this.criarServicoUseCase.execute(input);
        return this.presenter.present(servico);
    }

    async updateServico(
        id: string,
        input: UpdateServicoInputDto
    ): Promise<ServicoResponseDto | null> {
        const servico = await this.atualizarServicoUseCase.execute(id, input);
        return servico ? this.presenter.present(servico) : null;
    }

    async deleteServico(id: string): Promise<boolean> {
        return this.deletarServicoUseCase.execute(id);
    }
}
