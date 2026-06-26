import {
    AtualizarOrcamentoInputDto,
    OrcamentoResponseDto,
} from '../../application/dtos/orcamento/orcamento.dtos';
import { AtualizarOrcamentoUseCase } from '../../application/usecases/orcamento/atualizar-orcamento.usecase';
import { ListarOrcamentosPorOrdemUseCase } from '../../application/usecases/orcamento/listar-orcamentos-por-ordem.usecase';
import { OrcamentoPresenter } from '../presenters/orcamento.presenter';

type UseCaseFactory<T> = () => T;

export class OrcamentoController {
    constructor(
        private readonly getAtualizarOrcamentoUseCase: UseCaseFactory<AtualizarOrcamentoUseCase>,
        private readonly getListarOrcamentosPorOrdemUseCase: UseCaseFactory<ListarOrcamentosPorOrdemUseCase>,
        private readonly getPresenter: UseCaseFactory<OrcamentoPresenter>
    ) {}

    async updateOrcamento(
        id: string,
        updates: AtualizarOrcamentoInputDto
    ): Promise<OrcamentoResponseDto | null> {
        const orcamento = await this.getAtualizarOrcamentoUseCase().execute(id, updates);

        if (!orcamento) {
            return null;
        }

        return this.getPresenter().present(orcamento);
    }

    async getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<OrcamentoResponseDto[]> {
        const orcamentos = await this.getListarOrcamentosPorOrdemUseCase().execute(ordemServicoId);
        return this.getPresenter().presentList(orcamentos);
    }
}
