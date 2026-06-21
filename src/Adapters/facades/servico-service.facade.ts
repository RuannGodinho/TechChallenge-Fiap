import { CreateServicoInputDto, UpdateServicoInputDto } from '../../application/dtos/servico/servico.dtos';
import { Servico } from '../../enterprise/entities/servico.entity';
import { IServicoService } from '../../Interfaces/Servico/servico-service.interface';
import { CriarServicoUseCase } from '../../application/usecases/servico/criar-servico.usecase';
import { ListarServicosUseCase } from '../../application/usecases/servico/listar-servicos.usecase';
import { BuscarServicoPorIdUseCase } from '../../application/usecases/servico/buscar-servico-por-id.usecase';
import { AtualizarServicoUseCase } from '../../application/usecases/servico/atualizar-servico.usecase';
import { DeletarServicoUseCase } from '../../application/usecases/servico/deletar-servico.usecase';

export class ServicoServiceFacade implements IServicoService {
    constructor(
        private readonly listarServicosUseCase: ListarServicosUseCase,
        private readonly buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase,
        private readonly criarServicoUseCase: CriarServicoUseCase,
        private readonly atualizarServicoUseCase: AtualizarServicoUseCase,
        private readonly deletarServicoUseCase: DeletarServicoUseCase
    ) {}

    async getAllServicos(): Promise<Servico[]> {
        return this.listarServicosUseCase.execute();
    }

    async getServicoById(id: string): Promise<Servico | null> {
        return this.buscarServicoPorIdUseCase.execute(id);
    }

    async createServico(serviceData: Omit<Servico, 'id'>): Promise<Servico> {
        const input: CreateServicoInputDto = {
            nome: serviceData.nome,
            descricao: serviceData.descricao,
            preco: serviceData.preco,
        };
        return this.criarServicoUseCase.execute(input);
    }

    async updateServico(id: string, serviceData: Partial<Servico>): Promise<Servico | null> {
        const input: UpdateServicoInputDto = {
            nome: serviceData.nome,
            descricao: serviceData.descricao,
            preco: serviceData.preco,
        };
        return this.atualizarServicoUseCase.execute(id, input);
    }

    async deleteServico(id: string): Promise<boolean> {
        return this.deletarServicoUseCase.execute(id);
    }
}
