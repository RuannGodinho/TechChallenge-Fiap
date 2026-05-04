import { Cliente } from '../Entities/cliente';
import { IClienteRepository } from '../Interfaces/Cliente/cliente-repository.interface';
import { IClienteService } from '../Interfaces/Cliente/cliente-service.interface';
import { formatCpfCnpj, normalizeCpfCnpj } from '../utils/cpf-cnpj-utils';

export class ClienteService implements IClienteService {
    constructor(private repo: IClienteRepository) {}

    async getAllClientes(): Promise<Cliente[]> {
        return await this.repo.getAllClientes();
    }

    async getClienteById(id: string): Promise<Cliente | null> {
        const cliente = await this.repo.getClienteById(id);

        if (cliente != null)
            cliente.cpf = formatCpfCnpj(cliente.cpf);

        return cliente;
    }

    async getClienteByCpf(cpf: string): Promise<Cliente | null> {
        const normalized = normalizeCpfCnpj(cpf);

        const cliente = await this.repo.getClienteByCpf(normalized.stripped);

        if (cliente != null)
            cliente.cpf = formatCpfCnpj(cliente.cpf);

        return cliente;
    }

    async criarCliente(clienteData: Omit<Cliente, 'id'>): Promise<Cliente> {
        try {
            const cliente = new Cliente(clienteData.nome, clienteData.email, clienteData.cpf, clienteData.telefone);
            const normalized = normalizeCpfCnpj(cliente.cpf);

            cliente.cpf = normalized.stripped;
            const persistenceCliente = new Cliente(cliente.nome, cliente.email, cliente.cpf, cliente.telefone);
            await this.repo.criarCliente(persistenceCliente);

            cliente.cpf = normalized.formatted;
            return cliente;
        } catch (error: any) {
            throw new Error('Erro ao criar cliente:' + error.message);
        }
    }

    async atualizarCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
        const existing = await this.repo.getClienteById(id);

        if (!existing) return null;

        if (clienteData.cpf != null) {
            const normalized = normalizeCpfCnpj(clienteData.cpf);
            clienteData.cpf = normalized.stripped;
        }

        const updated = { ...existing, ...clienteData };

        await this.repo.atualizarCliente(id, updated);
        return updated;
    }

    async deletarCliente(id: string): Promise<boolean> {
        const existing = await this.repo.getClienteById(id);

        if (!existing) return false;

        await this.repo.deletarCliente(id);
        return true;
    }
}