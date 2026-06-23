import { IOrcamentoGateway } from '../../ports/orcamento.gateway.port';

export class VerificarUltimoOrcamentoAprovadoUseCase {
    constructor(private readonly orcamentoGateway: IOrcamentoGateway) {}

    async execute(ordemServicoId: string): Promise<boolean> {
        const orcamentos = await this.orcamentoGateway.findByOrdemServicoId(ordemServicoId);

        if (!orcamentos.length) {
            return false;
        }

        const orcamentoAtual = orcamentos.reduce((prev, curr) =>
            curr.versao > prev.versao ? curr : prev
        );

        return orcamentoAtual.status.isAprovado();
    }
}
