export interface CriarExecucoesParaServicosInputDto {
    ordemServicoId: string;
    servicoIds: string[];
}

export interface ExecucaoServicoResponseDto {
    id?: string;
    ordemServicoId: string;
    servicoId: string;
    status: string;
    iniciadoEm?: Date;
    finalizadoEm?: Date;
    criadoEm: Date;
}

export interface TempoMedioServicosResponseDto {
    tempoMedioMinutos: number;
    totalServicosFinalizados: number;
    maisRapidoMinutos: number;
    maisLentoMinutos: number;
}
