import { MongoClient, Db } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017/Node-Fiap");

let db: Db;

export async function connectDatabase(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db();

    db.collection("Clientes").createIndex(
      { Cpf: 1 },
      { unique: true }
    );
  }

  return db;
}
