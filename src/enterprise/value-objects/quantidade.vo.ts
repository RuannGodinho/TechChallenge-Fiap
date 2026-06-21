export class Quantidade {
    private readonly _value: number;

    private constructor(value: number) {
        this._value = value;
    }

    static from(value: number): Quantidade {
        if (!Number.isInteger(value) || value <= 0) {
            throw new Error('Quantidade inválida');
        }

        return new Quantidade(value);
    }

    static zero(): Quantidade {
        return new Quantidade(0);
    }

    get value(): number {
        return this._value;
    }

    add(other: Quantidade): Quantidade {
        return Quantidade.from(this._value + other.value);
    }

    subtract(other: Quantidade): Quantidade {
        if (other.value > this._value) {
            throw new Error('Quantidade insuficiente em estoque para a saída');
        }

        return new Quantidade(this._value - other.value);
    }

    isZero(): boolean {
        return this._value === 0;
    }
}
