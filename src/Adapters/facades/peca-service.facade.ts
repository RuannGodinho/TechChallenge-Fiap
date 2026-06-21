import { ObjectId } from 'mongodb';
import { CreatePecaInputDto, UpdatePecaInputDto } from '../../application/dtos/peca/peca.dtos';
import { Peca } from '../../enterprise/entities/peca.entity';
import { IPecaService } from '../../Interfaces/Peca/peca-service.interface';
import { CriarPecaUseCase } from '../../application/usecases/peca/criar-peca.usecase';
import { ListarPecasUseCase } from '../../application/usecases/peca/listar-pecas.usecase';
import { BuscarPecaPorIdUseCase } from '../../application/usecases/peca/buscar-peca-por-id.usecase';
import { AtualizarPecaUseCase } from '../../application/usecases/peca/atualizar-peca.usecase';
import { DeletarPecaUseCase } from '../../application/usecases/peca/deletar-peca.usecase';

export class PecaServiceFacade implements IPecaService {
    constructor(
        private readonly listarPecasUseCase: ListarPecasUseCase,
        private readonly buscarPecaPorIdUseCase: BuscarPecaPorIdUseCase,
        private readonly criarPecaUseCase: CriarPecaUseCase,
        private readonly atualizarPecaUseCase: AtualizarPecaUseCase,
        private readonly deletarPecaUseCase: DeletarPecaUseCase
    ) {}

    async getAllPecas(): Promise<Peca[]> {
        return this.listarPecasUseCase.execute();
    }

    async getPecaById(id: ObjectId): Promise<Peca | null> {
        return this.buscarPecaPorIdUseCase.execute(id.toString());
    }

    async createPeca(pecaData: Omit<Peca, 'id'>): Promise<Peca> {
        const input: CreatePecaInputDto = {
            nome: pecaData.nome,
            descricao: pecaData.descricao,
            tipo: pecaData.tipo,
            preco: pecaData.preco,
        };
        return this.criarPecaUseCase.execute(input);
    }

    async updatePeca(id: ObjectId, pecaData: Partial<Peca>): Promise<Peca | null> {
        const input: UpdatePecaInputDto = {
            nome: pecaData.nome,
            descricao: pecaData.descricao,
            tipo: pecaData.tipo,
            preco: pecaData.preco,
        };
        return this.atualizarPecaUseCase.execute(id.toString(), input);
    }

    async deletePeca(id: ObjectId): Promise<boolean> {
        return this.deletarPecaUseCase.execute(id.toString());
    }
}
