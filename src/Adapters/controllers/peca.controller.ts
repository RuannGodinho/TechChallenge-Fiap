import {
    CreatePecaInputDto,
    PecaResponseDto,
    UpdatePecaInputDto,
} from '../../application/dtos/peca/peca.dtos';
import { CriarPecaUseCase } from '../../application/usecases/peca/criar-peca.usecase';
import { ListarPecasUseCase } from '../../application/usecases/peca/listar-pecas.usecase';
import { BuscarPecaPorIdUseCase } from '../../application/usecases/peca/buscar-peca-por-id.usecase';
import { AtualizarPecaUseCase } from '../../application/usecases/peca/atualizar-peca.usecase';
import { DeletarPecaUseCase } from '../../application/usecases/peca/deletar-peca.usecase';
import { PecaPresenter } from '../presenters/peca.presenter';

export class PecaController {
    constructor(
        private readonly listarPecasUseCase: ListarPecasUseCase,
        private readonly buscarPecaPorIdUseCase: BuscarPecaPorIdUseCase,
        private readonly criarPecaUseCase: CriarPecaUseCase,
        private readonly atualizarPecaUseCase: AtualizarPecaUseCase,
        private readonly deletarPecaUseCase: DeletarPecaUseCase,
        private readonly presenter: PecaPresenter
    ) {}

    async getAllPecas(): Promise<PecaResponseDto[]> {
        const pecas = await this.listarPecasUseCase.execute();
        return this.presenter.presentList(pecas);
    }

    async getPecaById(id: string): Promise<PecaResponseDto | null> {
        const peca = await this.buscarPecaPorIdUseCase.execute(id);
        return peca ? this.presenter.present(peca) : null;
    }

    async createPeca(input: CreatePecaInputDto): Promise<PecaResponseDto> {
        const peca = await this.criarPecaUseCase.execute(input);
        return this.presenter.present(peca);
    }

    async updatePeca(
        id: string,
        input: UpdatePecaInputDto
    ): Promise<PecaResponseDto | null> {
        const peca = await this.atualizarPecaUseCase.execute(id, input);
        return peca ? this.presenter.present(peca) : null;
    }

    async deletePeca(id: string): Promise<boolean> {
        return this.deletarPecaUseCase.execute(id);
    }
}
