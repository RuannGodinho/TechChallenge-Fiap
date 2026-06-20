import { Collection, Db, ObjectId } from "mongodb";
import { connectDatabase } from "../infrastructure/database";
import { ExecucaoServico } from "../Entities/execucao-servico";
import { IExecucaoServicoRepository } from "../Interfaces/ExecucaoServico/execucao-servico-repository.interface";

export class ExecucaoServicoRepository implements IExecucaoServicoRepository {
  async getCollection(): Promise<Collection<ExecucaoServico>> {
    const db: Db = await connectDatabase();
    return db.collection<ExecucaoServico>("ExecucoesServico");
  }

  async createExecucaoServico(execucaoServico: ExecucaoServico): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(execucaoServico);
  }

  async createExecucoesServico(execucoes: ExecucaoServico[]): Promise<void> {
    if (execucoes.length === 0) {
      return;
    }

    const collection = await this.getCollection();
    await collection.insertMany(execucoes);
  }

  async getExecucaoById(id: string): Promise<ExecucaoServico | null> {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async updateExecucao(id: string, updates: Partial<ExecucaoServico>): Promise<ExecucaoServico | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );
    return result;
  }

  async getExecucoesFinalizadas(): Promise<ExecucaoServico[]> {
    const collection = await this.getCollection();
    return await collection
      .find({
        status: "FINALIZADO",
        iniciadoEm: { $ne: null },
        finalizadoEm: { $ne: null },
      })
      .toArray();
  }

  async getExecucoesByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]> {
    const collection = await this.getCollection();
    return await collection.find({ ordemServicoId: new ObjectId(ordemServicoId) }).toArray();
  }
}
