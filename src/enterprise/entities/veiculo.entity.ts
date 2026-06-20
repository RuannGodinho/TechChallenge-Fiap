import { Placa } from '../value-objects/placa.vo';

export class Veiculo {
    id?: string;
    placa: Placa;
    modelo: string;
    ano: number;
    marca: string;

    constructor(placa: Placa, modelo: string, ano: number, marca: string, id?: string) {
        this.placa = placa;
        this.modelo = modelo;
        this.ano = ano;
        this.marca = marca;
        this.id = id;
    }

    static create(placa: string, modelo: string, ano: number, marca: string): Veiculo {
        if (!modelo || modelo.trim() === '') {
            throw new Error('Modelo é obrigatório');
        }

        if (!marca || marca.trim() === '') {
            throw new Error('Marca é obrigatória');
        }

        if (!Number.isInteger(ano) || ano <= 0) {
            throw new Error('Ano inválido');
        }

        return new Veiculo(Placa.from(placa), modelo.trim(), ano, marca.trim());
    }
}
