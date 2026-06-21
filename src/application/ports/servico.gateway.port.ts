import { Servico } from '../../enterprise/entities/servico.entity';

export interface IServicoGateway {
    findAll(): Promise<Servico[]>;
    findById(id: string): Promise<Servico | null>;
    save(servico: Servico): Promise<Servico>;
    update(id: string, servico: Servico): Promise<Servico | null>;
    delete(id: string): Promise<boolean>;
}
