export class PecaId {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    static from(id: string): PecaId {
        if (!id || id.trim() === '') {
            throw new Error('ID da peça é obrigatório');
        }

        return new PecaId(id.trim());
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return this._value;
    }
}
