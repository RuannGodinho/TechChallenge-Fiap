import { Orcamento } from '../../enterprise/entities/orcamento.entity';

export interface IOrcamentoGateway {
    save(orcamento: Orcamento): Promise<Orcamento>;
    findById(id: string): Promise<Orcamento | null>;
    findByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]>;
    update(id: string, orcamento: Orcamento): Promise<Orcamento | null>;
}
