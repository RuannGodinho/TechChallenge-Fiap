import { Collection, Db, ObjectId } from "mongodb";
import { connectDatabase } from "../config/database";
import { Cliente } from "../Entities/Cliente";
import { IClienteRepository } from "../Interfaces/Cliente/IClienteRepository";

export class ClienteRepository implements IClienteRepository {
    private clientes = new Map<string, Cliente>();

     async getCollection(): Promise<Collection<Cliente>> {
        const db: Db = await connectDatabase();

        return db.collection<Cliente>("Clientes");
    }

    async getAllClientes(): Promise<Cliente[]> {
        const collection = await this.getCollection();
        return await collection.find().toArray();
    }

      async getClienteById(id: string): Promise<Cliente | null> {
        const collection = await this.getCollection();

        return await collection.findOne({ _id: new ObjectId(id) });
     }

    async testeMockCliente(id: string): Promise<string> {
        return "Ruann Correa Godinho";
    }

     async criarCliente(cliente: Cliente): Promise<void> {
        const collection = await this.getCollection();

        await collection.insertOne(cliente);
    }

    async atualizarCliente(id: string, cliente: Cliente): Promise<void> {
        const collection = await this.getCollection();
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: cliente });
    }

    async deletarCliente(id: string): Promise<void> {
        const collection = await this.getCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
    }

}