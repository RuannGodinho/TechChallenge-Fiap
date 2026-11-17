export interface IEstoqueMovimentacaoPort {
    assertQuantidadeDisponivel(pecaId: string, quantidade: number, ordemServicoId?: string): Promise<void>;
    registrarSaidaOS(pecaId: string, quantidade: number, ordemServicoId?: string): Promise<void>;
}
