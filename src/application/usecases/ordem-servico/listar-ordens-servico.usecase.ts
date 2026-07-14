import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';

export class ListarOrdensServicoUseCase {
    constructor(private readonly ordemServicoGateway: IOrdemServicoGateway) {}

    async execute(): Promise<OrdemServico[]> {
        const ordens = await this.ordemServicoGateway.findAll();

        return ordens
            .filter((ordem) => ordem.status.isVisivelNaListagem())
            .sort((a, b) => {
                const prioridadeStatus = a.status.prioridadeListagem() - b.status.prioridadeListagem();
                if (prioridadeStatus !== 0) {
                    return prioridadeStatus;
                }

                return a.dataAbertura.getTime() - b.dataAbertura.getTime();
            });
    }
}
