export const StatusClienteValues = {
    ATIVO: 'ATIVO',
    INATIVO: 'INATIVO',
} as const;

export type StatusClienteValue =
    (typeof StatusClienteValues)[keyof typeof StatusClienteValues];

export class StatusCliente {
    private readonly _value: StatusClienteValue;

    private constructor(value: StatusClienteValue) {
        this._value = value;
    }

    static from(status: string): StatusCliente {
        const normalized = status.trim().toUpperCase();
        const match = Object.values(StatusClienteValues).find(
            (value) => value === normalized
        );

        if (!match) {
            throw new Error('Status do cliente inválido');
        }

        return new StatusCliente(match);
    }

    static ativo(): StatusCliente {
        return new StatusCliente(StatusClienteValues.ATIVO);
    }

    static inativo(): StatusCliente {
        return new StatusCliente(StatusClienteValues.INATIVO);
    }

    get value(): StatusClienteValue {
        return this._value;
    }

    isAtivo(): boolean {
        return this._value === StatusClienteValues.ATIVO;
    }
}
