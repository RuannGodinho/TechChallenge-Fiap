import { TempoMedioServicosResponseDto } from '../../dtos/execucao-servico/execucao-servico.dtos';
import { IExecucaoServicoGateway } from '../../ports/execucao-servico.gateway.port';

export class ObterTempoMedioServicosUseCase {
    constructor(private readonly execucaoServicoGateway: IExecucaoServicoGateway) {}

    async execute(): Promise<TempoMedioServicosResponseDto> {
        const execucoes = await this.execucaoServicoGateway.findFinalizadas();

        if (!execucoes.length) {
            return {
                tempoMedioMinutos: 0,
                totalServicosFinalizados: 0,
                maisRapidoMinutos: 0,
                maisLentoMinutos: 0,
            };
        }

        const duracoes = execucoes.map((execucao) => {
            const inicio = execucao.iniciadoEm?.getTime() ?? 0;
            const fim = execucao.finalizadoEm?.getTime() ?? 0;
            return (fim - inicio) / 60000;
        });

        const totalServicosFinalizados = duracoes.length;
        const tempoMedioMinutos = Math.round(
            duracoes.reduce((sum, current) => sum + current, 0) / totalServicosFinalizados
        );
        const maisRapidoMinutos = Math.round(Math.min(...duracoes));
        const maisLentoMinutos = Math.round(Math.max(...duracoes));

        return {
            tempoMedioMinutos,
            totalServicosFinalizados,
            maisRapidoMinutos,
            maisLentoMinutos,
        };
    }
}
