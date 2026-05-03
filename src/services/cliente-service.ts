import { cpfValidator } from 'cpf-cnpj-validator';
import { Cliente } from '../Entities/cliente';
import { IClienteRepository } from '../Interfaces/Cliente/cliente-repository.interface';
import { IClienteService } from '../Interfaces/Cliente/cliente-service.interface';

export class ClienteService implements IClienteService {
    constructor(private repo: IClienteRepository) {}

    async getAllClientes(): Promise<Cliente[]> {
        return await this.repo.getAllClientes();
    }

    async getClienteById(id: string): Promise<Cliente | null> {
        const cliente = await this.repo.getClienteById(id);

        if (cliente != null)
            cliente.cpf = cpfValidator.format(cliente.cpf);

        return cliente;
    }

    async getClienteByCpf(cpf: string): Promise<Cliente | null> {
        const strippedCpf = cpfValidator.strip(cpf);

        if (!cpfValidator.isValid(strippedCpf))
            throw new Error("CPF inválido");

        const cliente = await this.repo.getClienteByCpf(strippedCpf);

        if (cliente != null)
            cliente.cpf = cpfValidator.format(cliente.cpf);

        return cliente;
    }

    async criarCliente(clienteData: Omit<Cliente, 'id'>): Promise<Cliente> {
        try {
        const cliente = new Cliente(clienteData.nome, clienteData.email, clienteData.cpf, clienteData.telefone);

        if (!cpfValidator.isValid(cliente.cpf))
            throw new Error("CPF inválido");

        cliente.cpf = cpfValidator.strip(cliente.cpf);
        
        await this.repo.criarCliente(cliente);

        cliente.cpf = cpfValidator.format(cliente.cpf);

        return cliente;
        } catch (error: any) {
            throw new Error("Erro ao criar cliente:" + error.message);
        }
    }

    async atualizarCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente | null> {
        const existing = await this.repo.getClienteById(id);

        if (!existing) return null;

        if (clienteData.cpf != null)
            clienteData.cpf = cpfValidator.strip(clienteData.cpf);

        const updated = { ...existing, ...clienteData };

        if (!cpfValidator.isValid(updated.cpf))
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