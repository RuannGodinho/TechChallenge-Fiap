import { Collection, Db, ObjectId } from "mongodb";
import { connectDatabase } from "../infrastructure/database";
import { Veiculo } from "../Entities/veiculo";
import { IVeiculoRepository } from "../Interfaces/Veiculo/veiculo-repository.interface";

export class VeiculoRepository implements IVeiculoRepository {
    async getCollection(): Promise<Collection<Veiculo>> {
        const db: Db = await connectDatabase();
        return db.collection<Veiculo>("Veiculos");
    }

    async getAllVeiculos(): Promise<Veiculo[]> {
        const collection = await this.getCollection();
        return await collection.find().toArray();
    }

    async getVeiculoById(id: string): Promise<Veiculo | null> {
        const collection = await this.getCollection();
        return await collection.findOne({ _id: new ObjectId(id) });
    }

    async criarVeiculo(veiculo: Veiculo): Promise<void> {
        const collection = await this.getCollection();
        await collection.insertOne(veiculo);
    }

    async atualizarVeiculo(id: string, veiculo: Veiculo): Promise<void> {
        const collection = await this.getCollection();
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: veiculo });
    }

    async deletarVeiculo(id: string): Promise<void> {
        const collection = await this.getCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
    }
}