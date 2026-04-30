import { Collection, Db, ObjectId } from 'mongodb';
import { connectDatabase } from '../config/database';
import { Peca } from '../Entities/Estoque/Peca';
import { IPecaRepository } from '../Interfaces/Peca/IPecaRepository';

export class PecaRepository implements IPecaRepository {
  async getCollection(): Promise<Collection<Peca>> {
    const db: Db = await connectDatabase();
    return db.collection<Peca>('Pecas');
  }

  async getAllPecas(): Promise<Peca[]> {
    const collection = await this.getCollection();
    return await collection.find().toArray();
  }

  async getPecaById(id: ObjectId): Promise<Peca | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async createPeca(peca: Peca): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(peca);
  }

  async updatePeca(id: ObjectId, peca: Peca): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ _id: new ObjectId(id) }, { $set: peca });
  }

  async deletePeca(id: ObjectId): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ _id: new ObjectId(id) });
  }
}
