export const TipoItem = {
  PECA: "PECA",
  INSUMO: "INSUMO"
} as const;

export type TipoItem = typeof TipoItem[keyof typeof TipoItem];