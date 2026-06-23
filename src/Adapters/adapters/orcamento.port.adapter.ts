import { IOrcamentoPort, CriarOrcamentoPendenteInput } from '../../application/ports/orcamento.port';
import { CriarOrcamentoPendenteUseCase } from '../../application/usecases/orcamento/criar-orcamento-pendente.usecase';
import { VerificarUltimoOrcamentoAprovadoUseCase } from '../../application/usecases/orcamento/verificar-ultimo-orcamento-aprovado.usecase';

export class OrcamentoPortAdapter implements IOrcamentoPort {
    constructor(
        private readonly criarOrcamentoPendenteUseCase: CriarOrcamentoPendenteUseCase,
        private readonly verificarUltimoOrcamentoAprovadoUseCase: VerificarUltimoOrcamentoAprovadoUseCase
    ) {}

    async createPendente(input: CriarOrcamentoPendenteInput): Promise<void> {
        await this.criarOrcamentoPendenteUseCase.execute(input);
    }

    async isLatestOrcamentoApproved(ordemServicoId: string): Promise<boolean> {
        return this.verificarUltimoOrcamentoAprovadoUseCase.execute(ordemServicoId);
    }
}
