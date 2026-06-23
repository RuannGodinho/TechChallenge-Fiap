import { ExecucaoServicoResponseDto } from '../../application/dtos/execucao-servico/execucao-servico.dtos';
import { ExecucaoServico } from '../../enterprise/entities/execucao-servico.entity';

export class ExecucaoServicoPresenter {
    present(execucao: ExecucaoServico): ExecucaoServicoResponseDto {
        const response: ExecucaoServicoResponseDto = {
            id: execucao.id,
            ordemServicoId: execucao.ordemServicoId,
            servicoId: execucao.servicoId,
            status: execucao.status.value,
            criadoEm: execucao.criadoEm,
        };

        if (execucao.iniciadoEm) {
            response.iniciadoEm = execucao.iniciadoEm;
        }

        if (execucao.finalizadoEm) {
            response.finalizadoEm = execucao.finalizadoEm;
        }

        return response;
    }

    presentList(execucoes: ExecucaoServico[]): ExecucaoServicoResponseDto[] {
        return execucoes.map((execucao) => this.present(execucao));
    }
}
