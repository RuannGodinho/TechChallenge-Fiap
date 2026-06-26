import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Orcamento } from '../../src/enterprise/entities/orcamento.entity';
import { IOrcamentoGateway } from '../../src/application/ports/orcamento.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const orcamentosStore = new Map<string, Orcamento>();

class InMemoryOrcamentoGateway implements IOrcamentoGateway {
    async save(orcamento: Orcamento): Promise<Orcamento> {
        const id = new ObjectId().toString();
        const saved = Orcamento.restore({
            id,
            ordemServicoId: orcamento.ordemServicoId,
            versao: orcamento.versao,
            status: orcamento.status.value,
            pecas: orcamento.pecas,
            itensServicos: orcamento.itensServicos,
            valorTotal: orcamento.valorTotal,
            validadeEm: orcamento.validadeEm,
            criadoEm: orcamento.criadoEm,
        });
        orcamentosStore.set(id, saved);
        return saved;
    }

    async findById(id: string): Promise<Orcamento | null> {
        return orcamentosStore.get(id) ?? null;
    }

    async findByOrdemServicoId(ordemServicoId: string): Promise<Orcamento[]> {
        return Array.from(orcamentosStore.values()).filter(
            (orcamento) => orcamento.ordemServicoId === ordemServicoId
        );
    }

    async update(id: string, orcamento: Orcamento): Promise<Orcamento | null> {
        if (!orcamentosStore.has(id)) {
            return null;
        }

        const updated = Orcamento.restore({
            id,
            ordemServicoId: orcamento.ordemServicoId,
            versao: orcamento.versao,
            status: orcamento.status.value,
            pecas: orcamento.pecas,
            itensServicos: orcamento.itensServicos,
            valorTotal: orcamento.valorTotal,
            validadeEm: orcamento.validadeEm,
            criadoEm: orcamento.criadoEm,
        });
        orcamentosStore.set(id, updated);
        return updated;
    }
}

const container = DIContainer.getInstance();
container.injectOrcamentoGateway(new InMemoryOrcamentoGateway());

import app from '../../app';

describe('Integração - Rotas de Orçamentos', () => {
    let token: string;

    beforeAll(async () => {
        token = await getAuthToken();
    });

    beforeEach(() => {
        orcamentosStore.clear();
    });

    test('deve listar orçamentos por ordem de serviço', async () => {
        const ordemServicoId = new ObjectId().toString();
        const gateway = new InMemoryOrcamentoGateway();
        await gateway.save(
            Orcamento.createPendente({
                ordemServicoId,
                pecas: [],
                servicos: [],
                valorTotal: 100,
            })
        );
        container.injectOrcamentoGateway(gateway);

        const response = await request(app)
            .get(`/api/orcamentos/${ordemServicoId}`)
            .auth(token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].ordemServicoId).toBe(ordemServicoId);
    });

    test('deve retornar 404 ao buscar orçamentos inexistentes', async () => {
        container.injectOrcamentoGateway(new InMemoryOrcamentoGateway());

        const response = await request(app)
            .get(`/api/orcamentos/${new ObjectId()}`)
            .auth(token, { type: 'bearer' });

        expect(response.status).toBe(404);
    });

    test('deve atualizar status do orçamento', async () => {
        const gateway = new InMemoryOrcamentoGateway();
        const saved = await gateway.save(
            Orcamento.createPendente({
                ordemServicoId: new ObjectId().toString(),
                pecas: [],
                servicos: [],
                valorTotal: 100,
            })
        );
        container.injectOrcamentoGateway(gateway);

        const response = await request(app)
            .put(`/api/orcamentos/${saved.id}`)
            .send({ status: 'APROVADO' })
            .auth(token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('APROVADO');
    });

    test('deve retornar 400 para status inválido', async () => {
        const gateway = new InMemoryOrcamentoGateway();
        const saved = await gateway.save(
            Orcamento.createPendente({
                ordemServicoId: new ObjectId().toString(),
                pecas: [],
                servicos: [],
                valorTotal: 100,
            })
        );
        container.injectOrcamentoGateway(gateway);

        const response = await request(app)
            .put(`/api/orcamentos/${saved.id}`)
            .send({ status: 'INVALIDO' })
            .auth(token, { type: 'bearer' });

        expect(response.status).toBe(400);
    });
});
