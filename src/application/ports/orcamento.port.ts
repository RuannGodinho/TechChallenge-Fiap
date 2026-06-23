import { PecaLookupData } from './peca-lookup.port';
import { ServicoLookupData } from './servico-lookup.port';

export interface CriarOrcamentoPendenteInput {
    ordemServicoId: string;
    valorTotal: number;
    pecas: Array<PecaLookupData & { quantidade: number }>;
    servicos: ServicoLookupData[];
}

export interface IOrcamentoPort {
    createPendente(input: CriarOrcamentoPendenteInput): Promise<void>;
    isLatestOrcamentoApproved(ordemServicoId: string): Promise<boolean>;
}
