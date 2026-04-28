import { Client } from '../Entities/Client';
import { IClientService } from '../Interfaces/IClientService';

export class ClientController {
    constructor(private service: IClientService) {}

    async getAllClients(): Promise<Client[]> {
        return await this.service.getAllClients();
    }

    async getClientById(id: string): Promise<Client | null> {
        return await this.service.getClientById(id);
    }

    async createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
        return await this.service.createClient(clientData);
    }

    async updateClient(id: string, clientData: Partial<Client>): Promise<Client | null> {
        return await this.service.updateClient(id, clientData);
    }

    async deleteClient(id: string): Promise<boolean> {
        return await this.service.deleteClient(id);
    }
}