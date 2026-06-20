export class Placa {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    static from(placa: string): Placa {
        if (!placa || placa.trim() === '') {
            throw new Error('Placa é obrigatória');
        }

        const normalized = placa.replace(/[-\s]/g, '').toUpperCase();
        const antiga = /^[A-Z]{3}[0-9]{4}$/;
        const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

        if (!antiga.test(normalized) && !mercosul.test(normalized)) {
            throw new Error('Placa inválida');
        }

        return new Placa(normalized);
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return this._value;
    }
}
