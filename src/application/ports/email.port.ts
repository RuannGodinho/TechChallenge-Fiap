export interface OrcamentoEmailPayload {
    versao: number;
    valorTotal: number;
    validadeEm: Date;
    pecas: Array<{ nome: string; quantidade: number; preco: number }>;
    servicos: Array<{ nome: string; preco: number }>;
}

export interface IEmailPort {
    sendOrcamentoPendente(payload: OrcamentoEmailPayload): Promise<void>;
}
