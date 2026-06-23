import { ObjectId } from 'mongodb';

export class VeiculoId {
    private readonly _value: string;

    private constructor(value: string) {
        this._value = value;
    }

    static from(id: string): VeiculoId {
        if (!id || id.trim() === '') {
            throw new Error('ID do veículo é obrigatório');
        }

        if (!ObjectId.isValid(id.trim())) {
            throw new Error('ID do veículo inválido');
        }

        return new VeiculoId(id.trim());
    }

    get value(): string {
        return this._value;
    }

    toString(): string {
        return this._value;
    }
}
