import { Cliente } from '../Entities/Cliente';

export interface IClienteRepository {
    getAllClientes(): Promise<Cliente[]>;
    getClienteById(id: string): Promise<Cliente | null>;
    criarCliente(cliente: Cliente): Promise<void>;
    atualizarCliente(id: string, cliente: Cliente): Promise<void>;
    deletarCliente(id: string): Promise<void>;
    testeMockCliente(id: string): Promise<string>;
}