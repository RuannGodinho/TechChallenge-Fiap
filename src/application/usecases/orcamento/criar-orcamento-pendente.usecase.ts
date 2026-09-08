import { CriarOrcamentoPendenteInputDto } from '../../dtos/orcamento/orcamento.dtos';
import { Orcamento } from '../../../enterprise/entities/orcamento.entity';
import { Peca } from '../../../enterprise/entities/peca.entity';
import { Servico } from '../../../enterprise/entities/servico.entity';
import { IEmailPort, OrcamentoEmailPayload } from '../../ports/email.port';
import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent } from '../../observability/business-events';

export class CriarOrcamentoPendenteUseCase {
    constructor(
        private readonly orcamentoGateway: IOrcamentoGateway,
        private readonly emailPort: IEmailPort,
        private readonly observability: IObservabilityPort
    ) {}

    async execute(input: CriarOrcamentoPendenteInputDto): Promise<void> {
        const pecas = input.pecas.map(
            (item) =>
                new Peca(
                    item.nome,
                    item.descricao,
                    item.preco,
                    item.tipo as Peca['tipo'],
                    item.id,
                    item.quantidade
                )
        );

        const servicos = input.servicos.map(
            (item) => new Servico(item.nome, item.descricao, item.preco, item.id)
        );

        const orcamento = Orcamento.createPendente({
            ordemServicoId: input.ordemServicoId,
            pecas,
            servicos,
            valorTotal: input.valorTotal,
        });

        const saved = await this.orcamentoGateway.save(orcamento);

        this.observability.emit({
            msg: BusinessEvent.orcamentoCreated,
            orcamentoId: saved.id,
            versao: saved.versao,
            ordemServicoId: saved.ordemServicoId,
        });

        await this.emailPort.sendOrcamentoPendente(this.toEmailPayload(saved));
    }

    private toEmailPayload(orcamento: Orcamento): OrcamentoEmailPayload {
        return {
            ordemServicoId: orcamento.ordemServicoId,
            orcamentoId: orcamento.id,
            versao: orcamento.versao,
            valorTotal: orcamento.valorTotal,
            validadeEm: orcamento.validadeEm,
            pecas: orcamento.pecas.map((peca) => ({
                nome: peca.nome,
                quantidade: peca.quantidade ?? 1,
                preco: peca.preco,
            })),
            servicos: orcamento.itensServicos.map((servico) => ({
                nome: servico.nome,
                preco: servico.preco,
            })),
        };
    }
}
