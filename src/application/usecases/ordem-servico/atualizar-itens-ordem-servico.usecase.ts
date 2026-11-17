import { AtualizarOrdemServicoInputDto } from '../../dtos/ordem-servico/ordem-servico.dtos';
import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { OrdemPecaItem } from '../../../enterprise/value-objects/ordem-peca-item.vo';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { IPecaLookupPort, PecaLookupData } from '../../ports/peca-lookup.port';
import { IServicoLookupPort, ServicoLookupData } from '../../ports/servico-lookup.port';
import { IEstoqueMovimentacaoPort } from '../../ports/estoque-movimentacao.port';
import { IOrcamentoPort, CriarOrcamentoPendenteInput } from '../../ports/orcamento.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent, BusinessReason } from '../../observability/business-events';

export class AtualizarItensOrdemServicoUseCase {
    constructor(
        private readonly pecaLookupPort: IPecaLookupPort,
        private readonly servicoLookupPort: IServicoLookupPort,
        private readonly estoqueMovimentacaoPort: IEstoqueMovimentacaoPort,
        private readonly orcamentoPort: IOrcamentoPort,
        private readonly observability: IObservabilityPort
    ) {}

    async execute(ordem: OrdemServico, input: AtualizarOrdemServicoInputDto, gerenciada = false): Promise<CriarOrcamentoPendenteInput | undefined> {
        if (!OrdemServico.temItensParaAtualizar(input.pecas, input.servicos)) {
            return;
        }

        let valorTotal = 0;
        const pecasProcessadas: OrdemPecaItem[] = [];
        const pecasOrcamento: Array<PecaLookupData & { quantidade: number }> = [];

        const pecas = input.pecas ?? ordem.pecas.map(item => ({ pecaId: item.pecaId.value, quantidade: item.quantidade }));
        const servicos = input.servicos ?? ordem.servicos;

        for (const item of pecas) {
            const peca = await this.pecaLookupPort.findById(item.pecaId);

            if (!peca) {
                throw new Error(`Peça não encontrada para o ID ${item.pecaId}`);
            }

            const quantidade = item.quantidade;

            try {
                await this.estoqueMovimentacaoPort.assertQuantidadeDisponivel(item.pecaId, quantidade);
            } catch (error) {
                this.observability.emit({
                    msg: BusinessEvent.osProcessingFailed,
                    alert: true,
                    reason: BusinessReason.estoqueInsuficiente,
                    ordemServicoId: ordem.id,
                    pecaId: item.pecaId,
                });
                throw error;
            }

            const valorUnitario = peca.preco;
            valorTotal += quantidade * valorUnitario;

            pecasProcessadas.push(OrdemPecaItem.create(item.pecaId, quantidade, valorUnitario));
            pecasOrcamento.push({ ...peca, quantidade });
        }

        const servicosProcessados: string[] = [];
        const servicosOrcamento: ServicoLookupData[] = [];

        for (const servicoId of servicos) {
            const servico = await this.servicoLookupPort.findById(servicoId.toString());

            if (!servico) {
                throw new Error(`Serviço não encontrado para o ID ${servicoId}`);
            }

            valorTotal += servico.preco;
            servicosProcessados.push(servico.id);
            servicosOrcamento.push(servico);
        }

        ordem.aplicarItens(pecasProcessadas, servicosProcessados, valorTotal);

        if (ordem.status.value === StatusOSValues.EM_DIAGNOSTICO) {
            if (gerenciada) return { ordemServicoId: ordem.id!, valorTotal, pecas: pecasOrcamento, servicos: servicosOrcamento };

            const transition = ordem.promoverParaAguardandoAprovacao();
            this.observability.emit({
                msg: BusinessEvent.osStatusChanged,
                ordemServicoId: ordem.id,
                from: transition.from,
                to: transition.to,
                durationMs: transition.durationMs,
            });
            return { ordemServicoId: ordem.id!, valorTotal, pecas: pecasOrcamento, servicos: servicosOrcamento };
        }
    }

    async criarOrcamento(input: CriarOrcamentoPendenteInput): Promise<void> {
        await this.orcamentoPort.createPendente(input);
    }
}
