export const StatusOrcamento = {
  PENDENTE: "PENDENTE",
  APROVADO: "APROVADO",
  REPROVADO: "REPROVADO",
  EXPIRADO: "EXPIRADO",
} as const;

export type StatusOrcamento = typeof StatusOrcamento[keyof typeof StatusOrcamento];
