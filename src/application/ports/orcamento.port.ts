import { CriarOrcamentoPendenteInputDto } from '../dtos/orcamento/orcamento.dtos';

export type CriarOrcamentoPendenteInput = CriarOrcamentoPendenteInputDto;

export interface IOrcamentoPort {
    createPendente(input: CriarOrcamentoPendenteInput): Promise<void>;
    isLatestOrcamentoApproved(ordemServicoId: string): Promise<boolean>;
    isPaymentConfirmed?(ordemServicoId: string): Promise<boolean>;
}
