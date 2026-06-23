import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { StatusOS } from '../../../enterprise/value-objects/status-os.vo';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { IOrcamentoPort } from '../../ports/orcamento.port';
import { IEstoqueMovimentacaoPort } from '../../ports/estoque-movimentacao.port';

export class AlterarStatusOrdemServicoUseCase {
    constructor(
        private readonly orcamentoPort: IOrcamentoPort,
        private readonly estoqueMovimentacaoPort: IEstoqueMovimentacaoPort
    ) {}

    async execute(ordem: OrdemServico, novoStatus: string): Promise<void> {
        const status = StatusOS.from(novoStatus);

        if (status.value === StatusOSValues.EM_EXECUCAO) {
            for (const item of ordem.pecas) {
                await this.estoqueMovimentacaoPort.assertQuantidadeDisponivel(
                    item.pecaId.value,
                    item.quantidade
                );
            }

            for (const item of ordem.pecas) {
                await this.estoqueMovimentacaoPort.registrarSaidaOS(
                    item.pecaId.value,
                    item.quantidade
                );
            }

            const aprovado = await this.orcamentoPort.isLatestOrcamentoApproved(ordem.id!);

            if (!aprovado) {
                throw new Error(
                    'Não é possível iniciar a execução da Ordem de Serviço se o orcamento não estiver aprovado.'
                );
            }
        }

        ordem.transicionarStatus(status);
    }
}
