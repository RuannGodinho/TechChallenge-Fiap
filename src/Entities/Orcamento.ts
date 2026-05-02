import { ObjectId } from "mongodb";
import { OrdemPecaItem } from "../ValueObjects/OrdemPecaItem";
import { Servico } from "./Servico";

export class Orcamento {
   ordemServicoId: ObjectId;
   versao: number;
   status: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'EXPIRADO';
   itensPecas: OrdemPecaItem[];
   itensServicos: Servico[];
   valorTotal: number;
   validadeEm: Date;
   criadoEm: Date;

   constructor(ordemServicoId: ObjectId, versao: number, status: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'EXPIRADO', itensPecas: OrdemPecaItem[], itensServicos: Servico[], valorTotal: number, validadeEm: Date, criadoEm: Date) {
       this.ordemServicoId = ordemServicoId;
       this.versao = versao;
       this.status = status;
       this.itensPecas = itensPecas;
       this.itensServicos = itensServicos;
       this.valorTotal = valorTotal;
       this.validadeEm = validadeEm;
       this.criadoEm = criadoEm;
   }
}