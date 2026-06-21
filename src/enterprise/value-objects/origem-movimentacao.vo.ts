export const OrigemMovimentacaoValues = {
    COMPRA: 'compra',
    OS: 'OS',
    AJUSTE: 'ajuste',
    ORDEM: 'ordem',
} as const;

export type OrigemMovimentacaoValue =
    (typeof OrigemMovimentacaoValues)[keyof typeof OrigemMovimentacaoValues];

export class OrigemMovimentacao {
    private readonly _value: OrigemMovimentacaoValue;

    private constructor(value: OrigemMovimentacaoValue) {
        this._value = value;
    }

    static from(origem: string): OrigemMovimentacao {
        const normalized = origem.trim();
        const allowed = Object.values(OrigemMovimentacaoValues);

        const match = allowed.find((value) => value.toLowerCase() === normalized.toLowerCase());

        if (!match) {
            throw new Error('Origem inválida. Use compra, OS, ajuste ou ordem');
        }

        return new OrigemMovimentacao(match);
    }

    get value(): OrigemMovimentacaoValue {
        return this._value;
    }
}
