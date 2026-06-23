export interface ServicoLookupData {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
}

export interface IServicoLookupPort {
    findById(id: string): Promise<ServicoLookupData | null>;
}
