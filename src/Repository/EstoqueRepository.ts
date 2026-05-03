import { Collection, Db, ObjectId } from 'mongodb';
import { connectDatabase } from '../config/database';
import { IEstoqueRepository } from '../Interfaces/Estoque/IEstoqueRepository';
import { Estoque } from '../Entities/Estoque/Estoque';

export class EstoqueRepository implements IEstoqueRepository {
  async getCollection(): Promise<Collection<Estoque>> {
    const db: Db = await connectDatabase();
    return db.collection<Estoque>('Estoque');
  }

  async getAllEstoque(): Promise<Estoque[]> {
    const collection = await this.getCollection();
    return await collection.find().toArray();
  }

  async createEstoque(estoque: Estoque): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(estoque);
  }

  async updateEstoque(pecaId: ObjectId, quantidade: number): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ pecaId: new ObjectId(pecaId) }, { $set: { quantidade: quantidade } });
  }

  async getEstoqueByPecaId(pecaId: ObjectId): Promise<Estoque | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ pecaId: new ObjectId(pecaId) });
  }

  async deleteEstoque(pecaId: ObjectId): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ pecaId: pecaId });
  }
}
