import { Estoque } from '../../enterprise/entities/estoque.entity';

export interface IEstoqueGateway {
    findAll(): Promise<Estoque[]>;
    findByPecaId(pecaId: string): Promise<Estoque | null>;
    save(estoque: Estoque): Promise<Estoque>;
}
