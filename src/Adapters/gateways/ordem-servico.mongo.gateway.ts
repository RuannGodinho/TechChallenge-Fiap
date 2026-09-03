import { Db, ObjectId } from 'mongodb';
import { OrdemServico } from '../../enterprise/entities/ordem-servico.entity';
import { IOrdemServicoGateway } from '../../application/ports/ordem-servico.gateway.port';
import { IObservabilityPort } from '../../application/ports/observability.port';
import { BusinessEvent } from '../../application/observability/business-events';
import {
    OrdemServicoMapper,
    OrdemServicoPersistenceModel,
} from './mappers/ordem-servico.mapper';

const NOOP_OBSERVABILITY: IObservabilityPort = { emit() {} };

export class OrdemServicoMongoGateway implements IOrdemServicoGateway {
    private readonly collection;

    constructor(
        private readonly db: Db,
        private readonly observability: IObservabilityPort = NOOP_OBSERVABILITY
    ) {
        this.collection = this.db.collection<OrdemServicoPersistenceModel>('OrdemServico');
    }

    async findAll(): Promise<OrdemServico[]> {
        const rows = await this.collection.find().toArray();
        return rows.map((row) => OrdemServicoMapper.toDomain(row));
    }

    async findById(id: string): Promise<OrdemServico | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const row = await this.collection.findOne({ _id: new ObjectId(id) });
        return row ? OrdemServicoMapper.toDomain(row) : null;
    }

    async findByCpfCnpj(cpfCnpj: string): Promise<OrdemServico[]> {
        const rows = await this.collection.find({ cpfCnpj }).toArray();
        return rows.map((row) => OrdemServicoMapper.toDomain(row));
    }

    async save(ordem: OrdemServico): Promise<OrdemServico> {
        try {
            const persistence = OrdemServicoMapper.toPersistence(ordem);
            const result = await this.collection.insertOne(persistence as OrdemServicoPersistenceModel);

            return OrdemServico.restore({
                id: result.insertedId.toString(),
                cpfCnpj: ordem.cpfCnpj.value,
                veiculoId: ordem.veiculoId.value,
                status: ordem.status.value,
                dataAbertura: ordem.dataAbertura,
                pecas: ordem.pecas.map((item) => ({
                    pecaId: item.pecaId.value,
                    quantidade: item.quantidade,
                    valorUnitario: item.valorUnitario,
                })),
                servicos: ordem.servicos,
                valorTotal: ordem.valorTotal,
                statusEnteredAt: ordem.statusEnteredAt,
            });
        } catch (error) {
            this.emitMongoFailure(ordem.id, error);
            throw error;
        }
    }

    async update(id: string, ordem: Partial<OrdemServico>): Promise<OrdemServico | null> {
        if (!ObjectId.isValid(id)) {
            return null;
        }

        const updates: Record<string, unknown> = {};

        if (ordem.cpfCnpj) {
            updates.cpfCnpj = ordem.cpfCnpj.value;
        }

        if (ordem.veiculoId) {
            updates.veiculo = new ObjectId(ordem.veiculoId.value);
        }

        if (ordem.status) {
            updates.status = ordem.status.value;
        }

        if (ordem.dataAbertura) {
            updates.dataAbertura = ordem.dataAbertura;
        }

        if (ordem.statusEnteredAt) {
            updates.statusEnteredAt = ordem.statusEnteredAt;
        }

        if (ordem.valorTotal != null) {
            updates.valorTotal = ordem.valorTotal;
        }

        if (ordem.pecas) {
            updates.pecas = ordem.pecas.map((item) => ({
                pecaId: new ObjectId(item.pecaId.value),
                quantidade: item.quantidade,
                valorUnitario: item.valorUnitario,
            }));
        }

        if (ordem.servicos) {
            updates.servicos = ordem.servicos.map((servicoId) => new ObjectId(servicoId));
        }

        try {
            const result = await this.collection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updates },
                { returnDocument: 'after' }
            );

            return result ? OrdemServicoMapper.toDomain(result) : null;
        } catch (error) {
            this.emitMongoFailure(id, error);
            throw error;
        }
    }

    private emitMongoFailure(ordemServicoId: string | undefined, error: unknown): void {
        this.observability.emit({
            msg: BusinessEvent.integrationFailed,
            integration: 'mongodb',
            ordemServicoId,
            err: error,
        });
    }
}

