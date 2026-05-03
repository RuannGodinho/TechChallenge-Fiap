import { Collection, Db, ObjectId } from 'mongodb';
import { connectDatabase } from '../config/database';
import { OrdemServico } from '../Entities/OrdemServico';
import { IOrdemServicoRepository } from '../Interfaces/OrdemServico/IOrdemServicoRepository';

export class OrdemServicoRepository implements IOrdemServicoRepository {
  async getCollection(): Promise<Collection<OrdemServico>> {
    const db: Db = await connectDatabase();
    return db.collection<OrdemServico>('OrdemServico');
  }

  async createOrdemServico(ordemServico: OrdemServico): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(ordemServico);
  }

  async listaOrdensServico(): Promise<OrdemServico[]> {
    const collection = await this.getCollection();
    return await collection.find().toArray();
  }

  async getOSById(id: string): Promise<OrdemServico | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }   

  async updateOrdemServico(id: string, updates: Partial<OrdemServico>): Promise<OrdemServico | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result;
  }
}