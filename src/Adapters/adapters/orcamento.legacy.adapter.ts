import { ObjectId } from 'mongodb';
import { IOrcamentoPort, CriarOrcamentoPendenteInput } from '../../application/ports/orcamento.port';
import { IOrcamentoService } from '../../Interfaces/Orcamento/orcamento-service.interface';
import { Orcamento } from '../../Entities/orcamento';
import { Peca } from '../../Entities/Estoque/peca';
import { Servico } from '../../Entities/servico';
import { StatusOrcamento } from '../../validators/status-orcamento';

export class OrcamentoLegacyAdapter implements IOrcamentoPort {
    constructor(private readonly orcamentoService: IOrcamentoService) {}

    async createPendente(input: CriarOrcamentoPendenteInput): Promise<void> {
        const pecas = input.pecas.map((item) => {
            const peca = new Peca(
                item.nome,
                item.descricao,
                item.preco,
                item.tipo as any,
                item.id,
                item.quantidade
            );
            return peca;
        });

        const servicos = input.servicos.map(
            (item) => new Servico(item.nome, item.descricao, item.preco, item.id)
        );

        const orcamento = new Orcamento(
            new ObjectId(input.ordemServicoId),
            1,
            'PENDENTE',
            pecas,
            servicos,
            input.valorTotal,
            new Date(),
            new Date()
        );

        await this.orcamentoService.createOrcamento(orcamento);
        await this.orcamentoService.enviaEmailCliente(orcamento);
    }

    async isLatestOrcamentoApproved(ordemServicoId: string): Promise<boolean> {
        const orcamentos = await this.orcamentoService.getOrcamentosByOrdemServicoId(ordemServicoId);

        if (!orcamentos.length) {
            return false;
        }

        const orcamentoAtual = orcamentos.reduce((prev, curr) =>
            curr.versao > prev.versao ? curr : prev
        );

        return orcamentoAtual.status === StatusOrcamento.APROVADO;
    }
}
