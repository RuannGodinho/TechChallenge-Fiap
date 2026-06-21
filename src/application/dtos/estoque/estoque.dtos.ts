export interface RegistrarMovimentacaoInputDto {
    pecaId: string;
    tipo: string;
    quantidade: number;
    data: Date;
    origem: string;
}

export interface EstoqueResponseDto {
    pecaId: string;
    quantidade: number;
}

export interface MovimentacaoEstoqueResponseDto {
    id?: string;
    pecaId: string;
    tipo: string;
    quantidade: number;
    data: Date;
    origem: string;
}
