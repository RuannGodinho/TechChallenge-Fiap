import { Orcamento } from '../../enterprise/entities/orcamento.entity';
import { AtualizarOrcamentoInputDto } from '../../application/dtos/orcamento/orcamento.dtos';

export interface IOrcamentoService {
    createOrcamento(orcamento: Orcamento): Promise<Orcamento>;
    updateOrcamento(id: string, updates: AtualizarOrcamentoInputDto): Promise<Orcamento | null>;
    getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]>;
    enviaEmailCliente(orcamento: Orcamento): Promise<string>;
}
