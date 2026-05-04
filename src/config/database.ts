import { MongoClient, Db } from "mongodb";

const mongoUrl = process.env.MONGODB_URI!;
export const client = new MongoClient(mongoUrl);

let db: Db | null = null;

export async function connectDatabase(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db();
  }

  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    db = null;
  }
}