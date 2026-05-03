import { Cliente } from '../Entities/cliente';
import { IClienteService } from '../Interfaces/Cliente/cliente-service.interface';

export class ClienteController {
    constructor(private service: IClienteService) {}

    async getAllClientes(): Promise<Cliente[]> {
        return await this.service.getAllClientes();
    }

    async getClienteById(id: string): Promise<Cliente | null> {
        return await this.service.getClienteById(id);
    }

    async getClienteByCpf(cpf: string): Promise<Cliente | null> {
        return await this.service.getClienteByCpf(cpf);
    }

    async criarCliente(clienteData: Omit<Cliente, 'id'>): Promise<Cliente> {
        return await this.service.criarCliente(clienteData);
    }

    async atualizarCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
        return await this.service.atualizarCliente(id, clienteData);
    }

    async deletarCliente(id: string): Promise<boolean> {
        return await this.service.deletarCliente(id);
    }
}