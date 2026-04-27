interface IClientService {
    getClientByName(id: string): Promise<string>;
}