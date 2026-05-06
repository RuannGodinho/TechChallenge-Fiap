import { ObjectId } from "mongodb";

export class ExecucaoServico {
    ordemServicoId: ObjectId;
    servicoId: ObjectId;
    status: 'PENDENTE' | 'EM EXECUCAO' | 'FINALIZADO';
    iniciadoEm: Date | null;
    finalizadoEm: Date | null;
    criadoEm: Date;

    constructor(
        ordemServicoId: ObjectId,
        servicoId: ObjectId,
        status: 'PENDENTE' | 'EM EXECUCAO' | 'FINALIZADO',
        iniciadoEm: Date | null,
        finalizadoEm: Date | null,
        criadoEm: Date
    ) {
        this.ordemServicoId = ordemServicoId;
        this.servicoId = servicoId;
        this.status = status;
        this.iniciadoEm = iniciadoEm;
        this.finalizadoEm = finalizadoEm;
        this.criadoEm = criadoEm;
    }
}