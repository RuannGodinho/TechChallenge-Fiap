import { MongoClient, Db } from "mongodb";

export const client = new MongoClient("mongodb://localhost:27017/Node-Fiap");

let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db();

    await db.collection("Clientes").createIndex(
      { Cpf: 1 },
      { unique: true }
    );
  }

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    db = null;
  }
}