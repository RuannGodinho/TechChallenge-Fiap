 export class ClientController {
    constructor(private service: IClientService) {}

    async getClientNameById(id: string): Promise<string> {
        const clientName = await this.service.getClientByName(id);
        return clientName;
    }

}