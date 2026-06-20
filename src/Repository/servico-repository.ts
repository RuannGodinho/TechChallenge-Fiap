import { Collection, Db, ObjectId } from "mongodb";
import { connectDatabase } from "../infrastructure/database";
import { Servico } from "../Entities/servico";
import { IServicoRepository } from "../Interfaces/Servico/servico-repository.interface";

export class ServicoRepository implements IServicoRepository {
    async getCollection(): Promise<Collection<Servico>> {
        const db: Db = await connectDatabase();
        return db.collection<Servico>("Servicos");
    }

    async getAllServicos(): Promise<Servico[]> {
        const collection = await this.getCollection();
        return await collection.find().toArray();
    }

    async getServicoById(id: string): Promise<Servico | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    async createServico(servico: Servico): Promise<void> {
        const collection = await this.getCollection();
        await collection.insertOne(servico);
    }

    async updateServico(id: string, servico: Servico): Promise<void> {
        const collection = await this.getCollection();
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: servico });
    }

    async deleteServico(id: string): Promise<void> {
        const collection = await this.getCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
    }
}