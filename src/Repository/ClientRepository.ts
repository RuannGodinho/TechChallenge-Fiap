export class ClientRepository implements IClientRepository {
    private clients = new Map<string, Client>();

      async getClientById(id: string): Promise<Client | null> {
        return this.clients.get(id) || null; 
     }

    async testeMockClient(id: string): Promise<string> {
        return "Ruann Correa Godinho";
    }

     async createClient(client: Client): Promise<void> {
        
    }

    async updateClient(id: string, client: Client): Promise<void> {
        
    }

    async deleteClient(id: string): Promise<void> {

    }

}