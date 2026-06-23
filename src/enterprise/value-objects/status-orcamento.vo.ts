export const StatusOrcamentoValues = {
    PENDENTE: 'PENDENTE',
    APROVADO: 'APROVADO',
    REPROVADO: 'REPROVADO',
    EXPIRADO: 'EXPIRADO',
} as const;

export type StatusOrcamentoValue = (typeof StatusOrcamentoValues)[keyof typeof StatusOrcamentoValues];

export class StatusOrcamento {
    private readonly _value: StatusOrcamentoValue;

    private constructor(value: StatusOrcamentoValue) {
        this._value = value;
    }

    static from(status: string): StatusOrcamento {
        const normalized = status.trim().toUpperCase();
        const match = Object.values(StatusOrcamentoValues).find((value) => value === normalized);

        if (!match) {
            throw new Error('Status inválido. Use PENDENTE, APROVADO, REPROVADO ou EXPIRADO');
        }

        return new StatusOrcamento(match);
    }

    static pendente(): StatusOrcamento {
        return new StatusOrcamento(StatusOrcamentoValues.PENDENTE);
    }

    get value(): StatusOrcamentoValue {
        return this._value;
    }

    isAprovado(): boolean {
        return this._value === StatusOrcamentoValues.APROVADO;
    }
}
