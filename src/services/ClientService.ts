import { cpfValidator } from 'cpf-cnpj-validator';
import { Client } from '../Entities/Client';
import { IClientRepository } from '../Interfaces/IClientRepository';
import { IClientService } from '../Interfaces/IClientService';
export class ClientService implements IClientService {
    constructor(private repo: IClientRepository) {}

    async getAllClients(): Promise<Client[]> {
        return await this.repo.getAllClients();
    }

    async getClientById(id: string): Promise<Client | null> {
        const client = await this.repo.getClientById(id);

        if(client != null)
            client.Cpf = cpfValidator.format(client.Cpf);

        return client;
    }

    async createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
        const client = new Client(clientData.Name, clientData.Email, clientData.Cpf, clientData.Phone);

        if(!cpfValidator.isValid(client.Cpf)) 
            throw new Error("CPF inválido");

        client.Cpf = cpfValidator.strip(client.Cpf);
        
        await this.repo.createClient(client);
        return client;
    }

    async updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
        const existing = await this.repo.getClientById(id);

        if (!existing) return null;

        if(clientData.Cpf != null)
            clientData.Cpf = cpfValidator.strip(clientData.Cpf);

        const updated = { ...existing, ...clientData };

        await this.repo.updateClient(id, updated);
        return updated;
    }

    async deleteClient(id: string): Promise<boolean> {
        const existing = await this.repo.getClientById(id);

        if (!existing) return false;

        await this.repo.deleteClient(id);
        return true;
    }
}