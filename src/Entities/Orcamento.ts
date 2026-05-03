import { ObjectId } from "mongodb";
import { Servico } from "./Servico";
import { Peca } from "./Estoque/Peca";

export class Orcamento {
   ordemServicoId: ObjectId;
   versao: number;
   status: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'EXPIRADO';
   pecas: Peca[];
   itensServicos: Servico[];
   valorTotal: number;
   validadeEm: Date;
   criadoEm: Date;

   constructor(ordemServicoId: ObjectId, versao: number, status: 'PENDENTE' | 'APROVADO' | 'REPROVADO' | 'EXPIRADO', pecas: Peca[], itensServicos: Servico[], valorTotal: number, validadeEm: Date, criadoEm: Date) {
       this.ordemServicoId = ordemServicoId;
       this.versao = versao;
       this.status = status;
       this.pecas = pecas;
       this.itensServicos = itensServicos;
       this.valorTotal = valorTotal;
       this.validadeEm = validadeEm;
       this.criadoEm = criadoEm;
   }
}