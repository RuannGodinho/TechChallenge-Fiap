import { Cliente } from '../../Entities/cliente';

export interface IClienteService {
    getAllClientes(): Promise<Cliente[]>;
    getClienteById(id: string): Promise<Cliente | null>;
    getClienteByCpf(cpf: string): Promise<Cliente | null>;
    criarCliente(cliente: Omit<Cliente, 'id'>): Promise<Cliente>;
    atualizarCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente | null>;
    deletarCliente(id: string): Promise<boolean>;
}