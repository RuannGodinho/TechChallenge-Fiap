export const TipoMovimentacaoValues = {
    ENTRADA: 'ENTRADA',
    SAIDA: 'SAIDA',
} as const;

export type TipoMovimentacaoValue =
    (typeof TipoMovimentacaoValues)[keyof typeof TipoMovimentacaoValues];

export class TipoMovimentacao {
    private readonly _value: TipoMovimentacaoValue;

    private constructor(value: TipoMovimentacaoValue) {
        this._value = value;
    }

    static from(tipo: string): TipoMovimentacao {
        const normalized = tipo.toUpperCase();

        if (
            normalized !== TipoMovimentacaoValues.ENTRADA &&
            normalized !== TipoMovimentacaoValues.SAIDA
        ) {
            throw new Error('Tipo inválido. Use ENTRADA ou SAIDA');
        }

        return new TipoMovimentacao(normalized);
    }

    get value(): TipoMovimentacaoValue {
        return this._value;
    }

    isEntrada(): boolean {
        return this._value === TipoMovimentacaoValues.ENTRADA;
    }

    isSaida(): boolean {
        return this._value === TipoMovimentacaoValues.SAIDA;
    }
}
