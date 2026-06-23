export interface PecaLookupData {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    tipo: string;
}

export interface IPecaLookupPort {
    findById(id: string): Promise<PecaLookupData | null>;
}
