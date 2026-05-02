export const StatusOS = {
  RECEBIDA: "Recebida",
  EM_DIAGNOSTICO: "Em Diagnostico",
  AGUARDANDO_APROVACAO: "Aguardando Aprovacao",
  EM_EXECUCAO: "Em Execucao",
  FINALIZADA: "Finalizada",
  ENTREGUE: "Entregue"
} as const;

export type TipoItem = typeof StatusOS[keyof typeof StatusOS];
