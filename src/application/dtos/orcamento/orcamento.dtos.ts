import { PecaLookupData } from '../../ports/peca-lookup.port';
import { ServicoLookupData } from '../../ports/servico-lookup.port';

export interface CriarOrcamentoPendenteInputDto {
    ordemServicoId: string;
    valorTotal: number;
    pecas: Array<PecaLookupData & { quantidade: number }>;
    servicos: ServicoLookupData[];
}

export interface AtualizarOrcamentoInputDto {
    ordemServicoId?: string;
    versao?: number;
    status?: string;
    valorTotal?: number;
    validadeEm?: Date;
}

export interface OrcamentoPecaResponseDto {
    id?: string;
    nome: string;
    descricao: string;
    tipo: string;
    preco: number;
    quantidade?: number;
}

export interface OrcamentoServicoResponseDto {
    id?: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidade?: number;
}

export interface OrcamentoResponseDto {
    id?: string;
    ordemServicoId: string;
    versao: number;
    status: string;
    pecas: OrcamentoPecaResponseDto[];
    itensServicos: OrcamentoServicoResponseDto[];
    valorTotal: number;
    validadeEm: Date;
    criadoEm: Date;
}
