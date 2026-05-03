import { ObjectId } from "mongodb";
import { OrdemPecaItem } from "../ValueObjects/ordem-peca-item";

export class OrdemServico {
    cpfCnpj: string;
    veiculo: ObjectId;
    status: 'RECEBIDA' | 'EM DIAGNOSTICO' | 'AGUARDANDO APROVACAO' | 'EM EXECUCAO' | 'FINALIZADA' | 'ENTREGUE';
    dataAbertura: Date;
    dataInicioServico?: Date;
    dataFechamento?: Date
    pecas?: OrdemPecaItem[];
    servicos?: ObjectId[];
    valorTotal?: number;

    constructor(cpfCnpj: string, veiculo: ObjectId, status: 'RECEBIDA' | 'EM DIAGNOSTICO' | 'AGUARDANDO APROVACAO' | 'EM EXECUCAO' | 'FINALIZADA' | 'ENTREGUE', dataAbertura: Date, pecas: OrdemPecaItem[], servicos: ObjectId[]) {
        this.cpfCnpj = cpfCnpj;
        this.veiculo = veiculo;
        this.status = status;
        this.dataAbertura = dataAbertura;
        this.pecas = pecas;
        this.servicos = servicos;
    }
}