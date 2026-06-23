import {
    AtualizarOrdemServicoInputDto,
    CriarOrdemServicoInputDto,
    OrdemServicoDetalhesResponseDto,
    OrdemServicoResponseDto,
} from '../../application/dtos/ordem-servico/ordem-servico.dtos';

import { CriarOrdemServicoUseCase } from '../../application/usecases/ordem-servico/criar-ordem-servico.usecase';
import { ListarOrdensServicoUseCase } from '../../application/usecases/ordem-servico/listar-ordens-servico.usecase';
import { BuscarOrdemServicoPorIdUseCase } from '../../application/usecases/ordem-servico/buscar-ordem-servico-por-id.usecase';
import { AtualizarOrdemServicoUseCase } from '../../application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { BuscarOrdensPorCpfCnpjUseCase } from '../../application/usecases/ordem-servico/buscar-ordens-por-cpf-cnpj.usecase';
import { OrdemServicoPresenter } from '../presenters/ordem-servico.presenter';

type UseCaseFactory<T> = () => T;

export class OrdemServicoController {
    constructor(
        private readonly getCriarOrdemServicoUseCase: UseCaseFactory<CriarOrdemServicoUseCase>,
        private readonly getListarOrdensServicoUseCase: UseCaseFactory<ListarOrdensServicoUseCase>,
        private readonly getBuscarOrdemServicoPorIdUseCase: UseCaseFactory<BuscarOrdemServicoPorIdUseCase>,
        private readonly getAtualizarOrdemServicoUseCase: UseCaseFactory<AtualizarOrdemServicoUseCase>,
        private readonly getBuscarOrdensPorCpfCnpjUseCase: UseCaseFactory<BuscarOrdensPorCpfCnpjUseCase>,
        private readonly getPresenter: UseCaseFactory<OrdemServicoPresenter>
    ) {}

    async createOrdemServico(input: CriarOrdemServicoInputDto): Promise<OrdemServicoResponseDto> {
        const ordem = await this.getCriarOrdemServicoUseCase().execute(input);
        return this.getPresenter().present(ordem);
    }

    async listaOrdensServico(): Promise<OrdemServicoResponseDto[]> {
        const ordens = await this.getListarOrdensServicoUseCase().execute();

        return this.getPresenter().presentList(ordens);
    }

    async buscarOrdemServicoPorId(id: string): Promise<OrdemServicoResponseDto | null> {
        const ordem = await this.getBuscarOrdemServicoPorIdUseCase().execute(id);

        return ordem ? this.getPresenter().present(ordem) : null;
    }

    async updateOrdemServico(
        id: string,
        updates: Record<string, unknown>
    ): Promise<OrdemServicoResponseDto> {
        const input: AtualizarOrdemServicoInputDto = {

            cpfCnpj: updates.cpfCnpj as string | undefined,

            veiculoId: (updates.veiculoId ?? updates.veiculo) as string | undefined,

            status: updates.status as string | undefined,

            pecas: updates.pecas as AtualizarOrdemServicoInputDto['pecas'],

            servicos: updates.servicos as string[] | undefined,

        };

        const ordem = await this.getAtualizarOrdemServicoUseCase().execute(id, input);

        return this.getPresenter().present(ordem);
    }

    async getOrdensServicoComDetalhesPorCpfCnpj(
        cpfCnpj: string
    ): Promise<OrdemServicoDetalhesResponseDto[]> {
        const detalhes = await this.getBuscarOrdensPorCpfCnpjUseCase().execute(cpfCnpj);
        return this.getPresenter().presentDetalhesList(detalhes);
    }
}


