import { Client } from '../Entities/Client';

export interface IClientService {
    getAllClients(): Promise<Client[]>;
    getClientById(id: string): Promise<Client | null>;
    createClient(client: Omit<Client, 'id'>): Promise<Client>;
    updateClient(id: string, client: Partial<Client>): Promise<Client | null>;
    deleteClient(id: string): Promise<boolean>;
}