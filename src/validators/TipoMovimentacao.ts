export const TipoMovimentacao = {
  ENTRADA: "ENTRADA",
  SAIDA: "SAIDA"
} as const;

export type TipoItem = typeof TipoMovimentacao[keyof typeof TipoMovimentacao];