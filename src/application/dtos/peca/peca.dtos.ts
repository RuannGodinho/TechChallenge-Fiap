import { TipoItem } from '../../../validators/tipo-item';

export interface CreatePecaInputDto {
    nome: string;
    descricao: string;
    tipo: string;
    preco: number;
}

export interface UpdatePecaInputDto {
    nome?: string;
    descricao?: string;
    tipo?: string;
    preco?: number;
}

export interface PecaResponseDto {
    id?: string;
    nome: string;
    descricao: string;
    tipo: TipoItem;
    preco: number;
    quantidade?: number;
}
