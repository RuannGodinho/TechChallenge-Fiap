import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';

export interface IOrdemServicoGateway {
    findAll(): Promise<OrdemServico[]>;
    findById(id: string): Promise<OrdemServico | null>;
    findByCpfCnpj(cpfCnpj: string): Promise<OrdemServico[]>;
    save(ordem: OrdemServico): Promise<OrdemServico>;
    update(id: string, ordem: Partial<OrdemServico>): Promise<OrdemServico | null>;
}
