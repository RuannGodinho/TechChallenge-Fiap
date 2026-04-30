import { Collection, Db } from 'mongodb';
import { connectDatabase } from '../config/database';
import { MovimentacaoEstoque } from '../Entities/Estoque/MovimentacaoEstoque';
import { IMovimentacaoEstoqueRepository } from '../Interfaces/MovimentacaoEstoque/IMovimentacaoEstoqueRepository';

export class MovimentacaoEstoqueRepository implements IMovimentacaoEstoqueRepository {
  async getCollection(): Promise<Collection<MovimentacaoEstoque>> {
    const db: Db = await connectDatabase();
    return db.collection<MovimentacaoEstoque>('MovimentacoesEstoque');
  }

  async createMovimentacao(movimentacao: MovimentacaoEstoque): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(movimentacao);
  }

  async listaMovimentacoes(): Promise<MovimentacaoEstoque[]> {
    const collection = await this.getCollection();
    return await collection.find().toArray();
  }
}
