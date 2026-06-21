export interface CreateServicoInputDto {
    nome: string;
    descricao: string;
    preco: number;
}

export interface UpdateServicoInputDto {
    nome?: string;
    descricao?: string;
    preco?: number;
}

export interface ServicoResponseDto {
    id?: string;
    nome: string;
    descricao: string;
    preco: number;
    quantidade?: number;
}
