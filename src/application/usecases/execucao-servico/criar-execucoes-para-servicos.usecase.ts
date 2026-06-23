import { CriarExecucoesParaServicosInputDto } from '../../dtos/execucao-servico/execucao-servico.dtos';
import { ExecucaoServico } from '../../../enterprise/entities/execucao-servico.entity';
import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { IExecucaoServicoGateway } from '../../ports/execucao-servico.gateway.port';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';
import { IServicoLookupPort } from '../../ports/servico-lookup.port';

export class CriarExecucoesParaServicosUseCase {
    constructor(
        private readonly execucaoServicoGateway: IExecucaoServicoGateway,
        private readonly ordemServicoGateway: IOrdemServicoGateway,
        private readonly servicoLookupPort: IServicoLookupPort
    ) {}

    async execute(input: CriarExecucoesParaServicosInputDto): Promise<void> {
        const ordem = await this.ordemServicoGateway.findById(input.ordemServicoId);

        if (!ordem) {
            throw new Error(
                `Ordem de serviço não encontrada para o id ${input.ordemServicoId}.`
            );
        }

        const servicoIdsUnicos = OrdemServico.dedupeServicos(input.servicoIds);
        const execucoesExistentes = await this.execucaoServicoGateway.findByOrdemServicoId(
            input.ordemServicoId
        );
        const servicosJaExecutados = new Set(
            execucoesExistentes.map((execucao) => execucao.servicoId)
        );

        const servicosNovos = servicoIdsUnicos.filter(
            (servicoId) => !servicosJaExecutados.has(servicoId)
        );

        if (!servicosNovos.length) {
            return;
        }

        const execucoes: ExecucaoServico[] = [];

        for (const servicoId of servicosNovos) {
            const servico = await this.servicoLookupPort.findById(servicoId);

            if (!servico) {
                throw new Error(`Serviço não encontrado para o id ${servicoId}.`);
            }

            execucoes.push(ExecucaoServico.create(input.ordemServicoId, servicoId));
        }

        await this.execucaoServicoGateway.saveMany(execucoes);
    }
}
