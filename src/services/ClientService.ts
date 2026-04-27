export class ClientService implements IClientService {
    constructor(private repo: IClientRepository) {}

    async getClientByName(id: string): Promise<string> {
        const nameMock = await this.repo.testeMockClient(id);
        
        return nameMock;
    }
}