import { Peca } from '../../enterprise/entities/peca.entity';

export interface IPecaGateway {
    findAll(): Promise<Peca[]>;
    findById(id: string): Promise<Peca | null>;
    save(peca: Peca): Promise<Peca>;
    update(id: string, peca: Peca): Promise<Peca | null>;
    delete(id: string): Promise<boolean>;
}
