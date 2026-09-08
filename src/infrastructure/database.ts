import { existsSync } from 'fs';
import { MongoClient, Db } from 'mongodb';
import { logger } from './logging/logger';

function isRunningInDocker(): boolean {
    return existsSync('/.dockerenv');
}

function getMongoUrl(): string {
    const uri =
        process.env.MONGODB_URI ??
        process.env.MONGO_URL ??
        'mongodb://127.0.0.1:27017/Node-Fiap';

    // Docker Compose hostname "mongodb" only resolves inside the compose network.
    // Rewrite to localhost only when running npm run dev on the host machine.
    if (!isRunningInDocker() && uri.includes('://mongodb:')) {
        return uri.replace('://mongodb:', '://127.0.0.1:');
    }

    return uri;
}

let mongoClient: MongoClient | null = null;
let db: Db | null = null;

function getClient(): MongoClient {
    if (!mongoClient) {
        mongoClient = new MongoClient(getMongoUrl());
    }
    return mongoClient;
}

export const client = {
    connect: () => getClient().connect(),
    close: () => getClient().close(),
};

export async function connectDatabase(): Promise<Db> {
    if (!db) {
        try {
            await getClient().connect();
            db = getClient().db();
            logger.info({ msg: 'mongodb_connected', integration: 'mongodb' });
        } catch (error) {
            logger.error({ err: error, msg: 'mongodb_connect_failed', integration: 'mongodb' });
            throw error;
        }
    }

    return db;
}

export async function closeDatabase(): Promise<void> {
    if (mongoClient) {
        await mongoClient.close();
        mongoClient = null;
        db = null;
    }
}

export async function pingDatabase(): Promise<void> {
    const database = await connectDatabase();
    await database.command({ ping: 1 });
}
