export class Veiculo {
    placa: string;
    modelo: string;
    ano: number;
    marca: string;

    constructor(placa: string, modelo: string, ano: number, marca: string) {
        this.placa = placa;
        this.modelo = modelo;
        this.ano = ano;
        this.marca = marca;
    }
}