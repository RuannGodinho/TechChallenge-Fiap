import request from 'supertest';
import { ObjectId } from 'mongodb';
import { ExecucaoServico } from '../../src/enterprise/entities/execucao-servico.entity';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { IExecucaoServicoGateway } from '../../src/application/ports/execucao-servico.gateway.port';
import { IOrdemServicoGateway } from '../../src/application/ports/ordem-servico.gateway.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const execucoesStore = new Map<string, ExecucaoServico>();

class InMemoryExecucaoServicoGateway implements IExecucaoServicoGateway {
    async save(execucao: ExecucaoServico): Promise<ExecucaoServico> {
        const id = new ObjectId().toString();
        const saved = ExecucaoServico.restore({
            id,
            ordemServicoId: execucao.ordemServicoId,
            servicoId: execucao.servicoId,
            status: execucao.status.value,
            criadoEm: execucao.criadoEm,
            iniciadoEm: execucao.iniciadoEm,
            finalizadoEm: execucao.finalizadoEm,
        });
        execucoesStore.set(id, saved);
        return saved;
    }

    async saveMany(execucoes: ExecucaoServico[]): Promise<void> {
        for (const execucao of execucoes) {
            await this.save(execucao);
        }
    }

    async findById(id: string): Promise<ExecucaoServico | null> {
        return execucoesStore.get(id) ?? null;
    }

    async findByOrdemServicoId(ordemServicoId: string): Promise<ExecucaoServico[]> {
        return Array.from(execucoesStore.values()).filter(
            (execucao) => execucao.ordemServicoId === ordemServicoId
        );
    }

    async findFinalizadas(): Promise<ExecucaoServico[]> {
        return Array.from(execucoesStore.values()).filter(
            (execucao) => execucao.status.value === 'FINALIZADO'
        );
    }

    async update(id: string, execucao: Partial<ExecucaoServico>): Promise<ExecucaoServico | null> {
        const existing = execucoesStore.get(id);
        if (!existing) {
            return null;
        }

        const updated = ExecucaoServico.restore({
            id,
            ordemServicoId: existing.ordemServicoId,
            servicoId: existing.servicoId,
            status: execucao.status?.value ?? existing.status.value,
            criadoEm: existing.criadoEm,
            iniciadoEm: execucao.iniciadoEm ?? existing.iniciadoEm,
            finalizadoEm: execucao.finalizadoEm ?? existing.finalizadoEm,
        });
        execucoesStore.set(id, updated);
        return updated;
    }
}

class InMemoryOrdemServicoGateway implements IOrdemServicoGateway {
    async findAll(): Promise<OrdemServico[]> {
        return [];
    }

    async findById(_id: string): Promise<OrdemServico | null> {
        return null;
    }

    async findByCpfCnpj(_cpfCnpj: string): Promise<OrdemServico[]> {
        return [];
    }

    async save(ordem: OrdemServico): Promise<OrdemServico> {
        return ordem;
    }

    async update(_id: string, ordem: Partial<OrdemServico>): Promise<OrdemServico | null> {
        return null;
    }
}

const container = DIContainer.getInstance();
container.injectExecucaoServicoGateway(new InMemoryExecucaoServicoGateway());
container.injectOrdemServicoGateway(new InMemoryOrdemServicoGateway());

import app from '../../app';

describe('Integração - Rotas de Execução de Serviço', () => {
    let token: string;

    beforeAll(async () => {
        token = await getAuthToken();
    });

    afterEach(() => {
        execucoesStore.clear();
    });

    test('deve validar criação manual de execução de serviço', async () => {
        const response = await request(app)
            .post('/api/execucoes-servico')
            .send({ ordemServicoId: new ObjectId().toString() })
            .auth(token, { type: 'bearer' });

        expect([400, 404, 500]).toContain(response.status);
    });

    test('deve retornar 404 ao iniciar execução inexistente', async () => {
        const response = await request(app)
            .patch(`/api/execucoes-servico/${new ObjectId().toString()}/iniciar`)
            .auth(token, { type: 'bearer' });

        expect(response.status).toBe(404);
        expect(response.body.error).toMatch(/não encontrada/);
    });

    test('deve retornar métricas de tempo médio com sucesso', async () => {
        const response = await request(app)
            .get('/api/metricas/tempo-medio-servicos')
            .auth(token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('tempoMedioMinutos');
        expect(response.body).toHaveProperty('totalServicosFinalizados');
    });
});
