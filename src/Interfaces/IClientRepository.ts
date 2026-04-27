interface IClientRepository {
    getClientById(id: string): Promise<Client | null>;
    createClient(client: Client): Promise<void>;
    updateClient(id: string, client: Client): Promise<void>;
    deleteClient(id: string): Promise<void>;
    testeMockClient(id: string): Promise<string>;
}