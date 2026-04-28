import { Collection, Db, ObjectId } from "mongodb";
import { connectDatabase } from "../config/database";
import { Client } from "../Entities/Client";
import { IClientRepository } from "../Interfaces/IClientRepository";

export class ClientRepository implements IClientRepository {
    private clients = new Map<string, Client>();

     async getCollection(): Promise<Collection<Client>> {
        const db: Db = await connectDatabase();

        return db.collection<Client>("Clients");
    }

    async getAllClients(): Promise<Client[]> {
        const collection = await this.getCollection();
        return await collection.find().toArray();
    }

      async getClientById(id: string): Promise<Client | null> {
        const collection = await this.getCollection();

        return await collection.findOne({ _id: new ObjectId(id) });
     }

    async testeMockClient(id: string): Promise<string> {
        return "Ruann Correa Godinho";
    }

     async createClient(client: Client): Promise<void> {
        const collection = await this.getCollection();

        await collection.insertOne(client);
    }

    async updateClient(id: string, client: Client): Promise<void> {
        const collection = await this.getCollection();
        await collection.updateOne({ _id: new ObjectId(id) }, { $set: client });
    }

    async deleteClient(id: string): Promise<void> {
        const collection = await this.getCollection();
        await collection.deleteOne({ _id: new ObjectId(id) });
    }

}