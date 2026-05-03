export const TipoMovimentacao = {
  ENTRADA: "ENTRADA",
  SAIDA: "SAIDA"
} as const;

export type TipoMovimentacao = typeof TipoMovimentacao[keyof typeof TipoMovimentacao];