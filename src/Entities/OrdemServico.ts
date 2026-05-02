import { ObjectId } from "mongodb";
import { OrdemPecaItem } from "../ValueObjects/OrdemPecaItem";

export class OrdemServico {
    CpfCnpj: string;
    Veiculo: ObjectId;
    Status: 'RECEBIDA' | 'EM DIAGNOSTICO' | 'AGUARDANDO APROVACAO' | 'EM EXECUCAO' | 'FINALIZADA' | 'ENTREGUE';
    DataAbertura: Date;
    DataInicioServico?: Date;
    DataFechamento?: Date
    Pecas?: OrdemPecaItem[];
    Servicos?: ObjectId[];
    ValorTotal?: number;

    constructor(CpfCnpj: string, Veiculo: ObjectId, Status: 'RECEBIDA' | 'EM DIAGNOSTICO' | 'AGUARDANDO APROVACAO' | 'EM EXECUCAO' | 'FINALIZADA' | 'ENTREGUE', DataAbertura: Date, Pecas: OrdemPecaItem[], Servicos: ObjectId[]) {
        this.CpfCnpj = CpfCnpj;
        this.Veiculo = Veiculo;
        this.Status = Status;
        this.DataAbertura = DataAbertura;
        this.Pecas = Pecas;
        this.Servicos = Servicos;
    }
}