import { MongoClient, Db } from "mongodb";

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/Node-Fiap";
export const client = new MongoClient(mongoUrl);

let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db();

    await db.collection("Clientes").createIndex(
      { cpf: 1 },
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