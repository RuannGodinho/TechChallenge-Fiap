import { cpfValidator } from 'cpf-cnpj-validator';
import { Cliente } from '../Entities/Cliente';
import { IClienteRepository } from '../Interfaces/Cliente/IClienteRepository';
import { IClienteService } from '../Interfaces/Cliente/IClienteService';

export class ClienteService implements IClienteService {
    constructor(private repo: IClienteRepository) {}

    async getAllClientes(): Promise<Cliente[]> {
        return await this.repo.getAllClientes();
    }

    async getClienteById(id: string): Promise<Cliente | null> {
        const cliente = await this.repo.getClienteById(id);

        if (cliente != null)
            cliente.Cpf = cpfValidator.format(cliente.Cpf);

        return cliente;
    }

    async getClienteByCpf(cpf: string): Promise<Cliente | null> {
        const strippedCpf = cpfValidator.strip(cpf);

        if (!cpfValidator.isValid(strippedCpf))
            throw new Error("CPF inválido");

        const cliente = await this.repo.getClienteByCpf(strippedCpf);

        if (cliente != null)
            cliente.Cpf = cpfValidator.format(cliente.Cpf);

        return cliente;
    }

    async criarCliente(clienteData: Omit<Cliente, 'id'>): Promise<Cliente> {
        try {
        const cliente = new Cliente(clienteData.Nome, clienteData.Email, clienteData.Cpf, clienteData.Telefone);

        if (!cpfValidator.isValid(cliente.Cpf))
            throw new Error("CPF inválido");

        cliente.Cpf = cpfValidator.strip(cliente.Cpf);
        
        await this.repo.criarCliente(cliente);

        cliente.Cpf = cpfValidator.format(cliente.Cpf);

        return cliente;
        } catch (error: any) {
            throw new Error("Erro ao criar cliente:" + error.message);
        }
    }

    async atualizarCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
        const existing = await this.repo.getClienteById(id);

        if (!existing) return null;

        if (clienteData.Cpf != null)
            clienteData.Cpf = cpfValidator.strip(clienteData.Cpf);

        const updated = { ...existing, ...clienteData };

        if (!cpfValidator.isValid(updated.Cpf))
            throw new Error("CPF inválido");

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