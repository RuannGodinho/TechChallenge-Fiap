export interface IEstoqueMovimentacaoPort {
    assertQuantidadeDisponivel(pecaId: string, quantidade: number): Promise<void>;
    registrarSaidaOS(pecaId: string, quantidade: number): Promise<void>;
}
