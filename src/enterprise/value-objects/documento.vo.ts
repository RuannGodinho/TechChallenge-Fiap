import { cpf, cnpj } from 'cpf-cnpj-validator';

export type TipoDocumento = 'CPF' | 'CNPJ';

export class Documento {
    private readonly _valor: string;
    private readonly _tipo: TipoDocumento;

    private constructor(valor: string, tipo: TipoDocumento) {
        this._valor = valor;
        this._tipo = tipo;
    }

    static from(valor: string): Documento {
        if (!valor) {
            throw new Error('Documento não pode ser vazio');
        }

        const strippedCpf = cpf.strip(valor);
        if (cpf.isValid(strippedCpf)) {
            return new Documento(strippedCpf, 'CPF');
        }

        const strippedCnpj = cnpj.strip(valor);
        if (cnpj.isValid(strippedCnpj)) {
            return new Documento(strippedCnpj, 'CNPJ');
        }

        throw new Error('CPF/CNPJ inválido');
    }

    get value(): string {
        return this._valor;
    }

    get type(): TipoDocumento {
        return this._tipo;
    }

    get formatted(): string {
        return this._tipo === 'CPF'
            ? cpf.format(this._valor)
            : cnpj.format(this._valor);
    }
}
