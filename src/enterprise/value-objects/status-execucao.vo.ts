export const StatusExecucaoValues = {
    PENDENTE: 'PENDENTE',
    EM_EXECUCAO: 'EM EXECUCAO',
    FINALIZADO: 'FINALIZADO',
} as const;

export type StatusExecucaoValue = (typeof StatusExecucaoValues)[keyof typeof StatusExecucaoValues];

export class StatusExecucao {
    private readonly _value: StatusExecucaoValue;

    private constructor(value: StatusExecucaoValue) {
        this._value = value;
    }

    static from(status: string): StatusExecucao {
        const normalized = status.trim().toUpperCase();
        const match = Object.values(StatusExecucaoValues).find(
            (value) => value.toUpperCase() === normalized
        );

        if (!match) {
            throw new Error('Status de execução inválido.');
        }

        return new StatusExecucao(match);
    }

    static pendente(): StatusExecucao {
        return new StatusExecucao(StatusExecucaoValues.PENDENTE);
    }

    static emExecucao(): StatusExecucao {
        return new StatusExecucao(StatusExecucaoValues.EM_EXECUCAO);
    }

    static finalizado(): StatusExecucao {
        return new StatusExecucao(StatusExecucaoValues.FINALIZADO);
    }

    get value(): StatusExecucaoValue {
        return this._value;
    }

    isPendente(): boolean {
        return this._value === StatusExecucaoValues.PENDENTE;
    }

    isEmExecucao(): boolean {
        return this._value === StatusExecucaoValues.EM_EXECUCAO;
    }

    isFinalizado(): boolean {
        return this._value === StatusExecucaoValues.FINALIZADO;
    }
}
