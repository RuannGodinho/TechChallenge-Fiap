import { Estoque } from '../Entities/Estoque/Estoque';
import { MovimentacaoEstoque } from '../Entities/Estoque/MovimentacaoEstoque';
import { IEstoqueService } from '../Interfaces/Estoque/IEstoqueService';
import { ObjectId } from 'mongodb';

export class EstoqueController {
  constructor(private service: IEstoqueService) {}

  async getAllEstoque(): Promise<Estoque[]> {
    return await this.service.getAllEstoque();
  }

  async getEstoqueByPecaId(pecaId: string): Promise<Estoque | null> {
    return await this.service.getEstoqueByPecaId(new ObjectId(pecaId));
  }

  async deleteEstoque(pecaId: string): Promise<boolean> {
    return await this.service.deleteEstoque(new ObjectId(pecaId));
  }

  async createMovimentacao(movimentacaoData: Omit<MovimentacaoEstoque, 'id'>): Promise<MovimentacaoEstoque> {
    return await this.service.createMovimentacao(movimentacaoData);
  }
  
  async listaMovimentacoes(): Promise<MovimentacaoEstoque[]> {
    return await this.service.listaMovimentacoes();
  }
  
}
