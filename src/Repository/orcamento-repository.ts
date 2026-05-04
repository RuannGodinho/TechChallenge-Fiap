import { Collection, Db, ObjectId } from 'mongodb';
import { connectDatabase } from '../config/database';
import { Orcamento } from '../Entities/orcamento';
import { IOrcamentoRepository } from '../Interfaces/Orcamento/orcamento-repository.interface';

export class OrcamentoRepository implements IOrcamentoRepository {
  async getCollection(): Promise<Collection<Orcamento>> {
    const db: Db = await connectDatabase();
    return db.collection<Orcamento>('Orcamento');
  }

  async createOrcamento(orcamento: Orcamento): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(orcamento);
  }

  async getOrcamentoById(id: string): Promise<Orcamento | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
    const collection = await this.getCollection();
    return await collection.find({ ordemServicoId: new ObjectId(ordemServicoId) }).toArray();
  }  

  async updateOrcamento(id: string, updates: Partial<Orcamento>): Promise<Orcamento | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    return result;
  }
}