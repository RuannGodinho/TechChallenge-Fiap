import { Orcamento } from '../../enterprise/entities/orcamento.entity';
import { IOrcamentoService } from '../../Interfaces/Orcamento/orcamento-service.interface';
import { AtualizarOrcamentoInputDto } from '../../application/dtos/orcamento/orcamento.dtos';
import { SalvarOrcamentoUseCase } from '../../application/usecases/orcamento/salvar-orcamento.usecase';
import { AtualizarOrcamentoUseCase } from '../../application/usecases/orcamento/atualizar-orcamento.usecase';
import { ListarOrcamentosPorOrdemUseCase } from '../../application/usecases/orcamento/listar-orcamentos-por-ordem.usecase';

export class OrcamentoServiceFacade implements IOrcamentoService {
    constructor(
        private readonly salvarOrcamentoUseCase: SalvarOrcamentoUseCase,
        private readonly atualizarOrcamentoUseCase: AtualizarOrcamentoUseCase,
        private readonly listarOrcamentosPorOrdemUseCase: ListarOrcamentosPorOrdemUseCase
    ) {}

    async createOrcamento(orcamento: Orcamento): Promise<Orcamento> {
        return this.salvarOrcamentoUseCase.execute(orcamento);
    }

    async updateOrcamento(
        id: string,
        updates: AtualizarOrcamentoInputDto
    ): Promise<Orcamento | null> {
        return this.atualizarOrcamentoUseCase.execute(id, updates);
    }

    async getOrcamentosByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
        return this.listarOrcamentosPorOrdemUseCase.execute(ordemServicoId);
    }

    async enviaEmailCliente(_orcamento: Orcamento): Promise<string> {
        return 'Email enviado com sucessso';
    }
}
