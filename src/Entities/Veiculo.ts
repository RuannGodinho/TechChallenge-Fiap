export class Veiculo {
    Placa: string;
    Modelo: string;
    Ano: number;
    Marca: string;

    constructor(placa: string, modelo: string, ano: number, marca: string) {
        this.Placa = placa;
        this.Modelo = modelo;
        this.Ano = ano;
        this.Marca = marca;
    }
}