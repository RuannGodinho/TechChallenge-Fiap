import { StatusExecucao } from '../value-objects/status-execucao.vo';

export class ExecucaoServico {
    id?: string;
    ordemServicoId: string;
    servicoId: string;
    status: StatusExecucao;
    iniciadoEm?: Date;
    finalizadoEm?: Date;
    criadoEm: Date;

    constructor(
        ordemServicoId: string,
        servicoId: string,
        status: StatusExecucao,
        criadoEm: Date,
        id?: string,
        iniciadoEm?: Date,
        finalizadoEm?: Date
    ) {
        this.ordemServicoId = ordemServicoId;
        this.servicoId = servicoId;
        this.status = status;
        this.criadoEm = criadoEm;
        this.id = id;
        this.iniciadoEm = iniciadoEm;
        this.finalizadoEm = finalizadoEm;
    }

    static create(ordemServicoId: string, servicoId: string): ExecucaoServico {
        return new ExecucaoServico(
            ordemServicoId,
            servicoId,
            StatusExecucao.pendente(),
            new Date()
        );
    }

    static restore(props: {
        id?: string;
        ordemServicoId: string;
        servicoId: string;
        status: string;
        criadoEm: Date;
        iniciadoEm?: Date;
        finalizadoEm?: Date;
    }): ExecucaoServico {
        return new ExecucaoServico(
            props.ordemServicoId,
            props.servicoId,
            StatusExecucao.from(props.status),
            props.criadoEm,
            props.id,
            props.iniciadoEm,
            props.finalizadoEm
        );
    }

    iniciar(): void {
        if (this.status.isEmExecucao()) {
            throw new Error('Execução já iniciada.');
        }

        if (this.status.isFinalizado()) {
            throw new Error('Não é possível iniciar uma execução já finalizada.');
        }

        this.status = StatusExecucao.emExecucao();
        this.iniciadoEm = new Date();
    }

    finalizar(): void {
        if (this.status.isPendente()) {
            throw new Error('Execução ainda não iniciada.');
        }

        if (this.status.isFinalizado()) {
            throw new Error('Execução já finalizada.');
        }

        this.status = StatusExecucao.finalizado();
        this.finalizadoEm = new Date();
    }
}
