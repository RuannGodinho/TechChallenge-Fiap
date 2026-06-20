import { Cliente } from '../../enterprise/entities/cliente.entity';
import { Documento } from '../../enterprise/value-objects/documento.vo';

export interface IClienteGateway {
    findAll(): Promise<Cliente[]>;
    findById(id: string): Promise<Cliente | null>;
    findByDocumento(documento: Documento): Promise<Cliente | null>;
    save(cliente: Cliente): Promise<Cliente>;
    update(id: string, cliente: Cliente): Promise<Cliente | null>;
    delete(id: string): Promise<boolean>;
}
