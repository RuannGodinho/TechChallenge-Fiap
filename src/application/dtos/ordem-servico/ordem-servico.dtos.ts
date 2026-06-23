import { OrdemServico } from "../../../enterprise/entities/ordem-servico.entity";

import { Veiculo } from "../../../enterprise/entities/veiculo.entity";

import { OrdemPecaItem } from "../../../enterprise/value-objects/ordem-peca-item.vo";

import { PecaLookupData } from "../../ports/peca-lookup.port";

import { ServicoLookupData } from "../../ports/servico-lookup.port";

export interface OrdemPecaItemDto {
    pecaId: string;
    quantidade: number;
    valorUnitario: number;
}

export interface CriarOrdemServicoInputDto {
    cpfCnpj: string;
    veiculoId: string;
    pecas?: Array<{ pecaId: string; quantidade: number; valorUnitario?: number }>;
    servicos?: string[];
}

export interface OrdemServicoResponseDto {
    id?: string;
    cpfCnpj: string;
    veiculoId: string;
    status: string;
    dataAbertura: Date;
    pecas: OrdemPecaItemDto[];
    servicos: string[];
    valorTotal?: number;
}

export interface AtualizarOrdemServicoInputDto {
    cpfCnpj?: string;

    veiculoId?: string;

    status?: string;

    pecas?: Array<{ pecaId: string; quantidade: number; valorUnitario?: number }>;

    servicos?: string[];
}

export interface OrdemServicoDetalhesInput {
    ordem: OrdemServico;

    veiculo: Veiculo | null;

    pecas: Array<{ item: OrdemPecaItem; peca: PecaLookupData }>;

    servicos: ServicoLookupData[];
}

export interface OrdemServicoDetalhesResponseDto {
    cpfCnpj: string;

    status: string;

    dataAbertura: Date;

    valorTotal?: number;

    veiculo: {
        placa: string;
        modelo: string;
        ano: number;
        marca: string;
    } | null;

    pecas: Array<{
        peca: {
            nome: string;
            descricao: string;
            preco: number;
            tipo: string;
        };

        quantidade: number;
        valorUnitario: number;
        subtotal: number;
    }>;

    servicos: Array<{
        nome: string;

        descricao: string;

        preco: number;
    }>;
}
