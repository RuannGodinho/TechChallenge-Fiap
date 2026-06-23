import { AtualizarOrdemServicoInputDto } from '../../dtos/ordem-servico/ordem-servico.dtos';
import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { OrdemPecaItem } from '../../../enterprise/value-objects/ordem-peca-item.vo';
import { StatusOSValues } from '../../../enterprise/value-objects/status-os.vo';
import { IPecaLookupPort, PecaLookupData } from '../../ports/peca-lookup.port';
import { IServicoLookupPort, ServicoLookupData } from '../../ports/servico-lookup.port';
import { IEstoqueMovimentacaoPort } from '../../ports/estoque-movimentacao.port';
import { IOrcamentoPort } from '../../ports/orcamento.port';

export class AtualizarItensOrdemServicoUseCase {
    constructor(
        private readonly pecaLookupPort: IPecaLookupPort,
        private readonly servicoLookupPort: IServicoLookupPort,
        private readonly estoqueMovimentacaoPort: IEstoqueMovimentacaoPort,
        private readonly orcamentoPort: IOrcamentoPort
    ) {}

    async execute(ordem: OrdemServico, input: AtualizarOrdemServicoInputDto): Promise<void> {
        if (!OrdemServico.temItensParaAtualizar(input.pecas, input.servicos)) {
            return;
        }

        let valorTotal = 0;
        const pecasProcessadas: OrdemPecaItem[] = [];
        const pecasOrcamento: Array<PecaLookupData & { quantidade: number }> = [];

        for (const item of input.pecas ?? []) {
            const peca = await this.pecaLookupPort.findById(item.pecaId);

            if (!peca) {
                throw new Error(`Peça não encontrada para o ID ${item.pecaId}`);
            }

            const quantidade = item.quantidade;

            await this.estoqueMovimentacaoPort.assertQuantidadeDisponivel(item.pecaId, quantidade);

            const valorUnitario = peca.preco;
            valorTotal += quantidade * valorUnitario;

            pecasProcessadas.push(OrdemPecaItem.create(item.pecaId, quantidade, valorUnitario));
            pecasOrcamento.push({ ...peca, quantidade });
        }

        const servicosProcessados: string[] = [];
        const servicosOrcamento: ServicoLookupData[] = [];

        for (const servicoId of input.servicos ?? []) {
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
            await this.orcamentoPort.createPendente({
                ordemServicoId: ordem.id!,
                valorTotal,
                pecas: pecasOrcamento,
                servicos: servicosOrcamento,
            });

            ordem.promoverParaAguardandoAprovacao();
        }
    }
}
