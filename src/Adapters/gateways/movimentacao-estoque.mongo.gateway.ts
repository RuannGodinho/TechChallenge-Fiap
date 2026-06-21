import { Db, ObjectId } from 'mongodb';
import { MovimentacaoEstoque } from '../../enterprise/entities/movimentacao-estoque.entity';
import { IMovimentacaoEstoqueGateway } from '../../application/ports/movimentacao-estoque.gateway.port';
import {
    MovimentacaoEstoqueMapper,
    MovimentacaoEstoquePersistenceModel,
} from './mappers/movimentacao-estoque.mapper';

export class MovimentacaoEstoqueMongoGateway implements IMovimentacaoEstoqueGateway {
    private readonly collection;

    constructor(private readonly db: Db) {
        this.collection =
            this.db.collection<MovimentacaoEstoquePersistenceModel>('MovimentacoesEstoque');
    }

    async findAll(): Promise<MovimentacaoEstoque[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => MovimentacaoEstoqueMapper.toDomain(row));
    }

    async save(movimentacao: MovimentacaoEstoque): Promise<MovimentacaoEstoque> {
        const persistence = MovimentacaoEstoqueMapper.toPersistence(movimentacao);
        const result = await this.collection.insertOne({
            ...persistence,
            pecaId: new ObjectId(movimentacao.pecaId.value),
        });

        return new MovimentacaoEstoque(
            movimentacao.pecaId,
            movimentacao.tipo,
            movimentacao.quantidade,
            movimentacao.data,
            movimentacao.origem,
            result.insertedId.toString()
        );
    }
}
