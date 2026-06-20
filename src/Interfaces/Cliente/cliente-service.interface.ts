import { Cliente } from '../../enterprise/entities/cliente.entity';

export interface IClienteService {
    getAllClientes(): Promise<Cliente[]>;
    getClienteById(id: string): Promise<Cliente | null>;
    getClienteByCpf(cpf: string): Promise<Cliente | null>;
    criarCliente(cliente: {
        nome: string;
        email: string;
        cpf: string;
        telefone: string;
    }): Promise<Cliente>;
    atualizarCliente(id: string, cliente: {
        nome?: string;
        email?: string;
        cpf?: string;
        telefone?: string;
    }): Promise<Cliente | null>;
    deletarCliente(id: string): Promise<boolean>;
}
