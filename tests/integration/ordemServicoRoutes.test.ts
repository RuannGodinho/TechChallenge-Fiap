import request from 'supertest';
import { ObjectId } from 'mongodb';
import { Cliente } from '../../src/enterprise/entities/cliente.entity';
import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { IClienteGateway } from '../../src/application/ports/cliente.gateway.port';
import { IVeiculoGateway } from '../../src/application/ports/veiculo.gateway.port';
import { IOrdemServicoGateway } from '../../src/application/ports/ordem-servico.gateway.port';
import { IExecucaoServicoPort } from '../../src/application/ports/execucao-servico.port';
import { DIContainer } from '../../src/infrastructure/composition-root/di-container';
import { getAuthToken } from '../Helper/getAuthToken';

const clientesStore = new Map<string, Cliente>();
const veiculosStore = new Map<string, Veiculo>();
const ordensStore = new Map<string, OrdemServico>();

class InMemoryClienteGateway implements IClienteGateway {
    async findAll(): Promise<Cliente[]> {
        return Array.from(clientesStore.values());
    }

    async findById(id: string): Promise<Cliente | null> {
        return Array.from(clientesStore.values()).find((cliente) => cliente.id === id) ?? null;
    }

    async findByDocumento(documento: { value: string }): Promise<Cliente | null> {
        return (
            Array.from(clientesStore.values()).find(
                (cliente) => cliente.documento.value === documento.value
            ) ?? null
        );
    }

    async save(cliente: Cliente): Promise<Cliente> {
        const id = new ObjectId().toString();
        const saved = new Cliente(
            cliente.nome,
            cliente.email,
            cliente.documento,
            cliente.telefone,
            id
        );
        clientesStore.set(id, saved);
        return saved;
    }

    async update(id: string, cliente: Cliente): Promise<Cliente | null> {
        if (!clientesStore.has(id)) {
            return null;
        }
        clientesStore.set(id, cliente);
        return cliente;
    }

    async delete(id: string): Promise<boolean> {
        return clientesStore.delete(id);
    }
}

class InMemoryVeiculoGateway implements IVeiculoGateway {
    async findAll(): Promise<Veiculo[]> {
        return Array.from(veiculosStore.values());
    }

    async findById(id: string): Promise<Veiculo | null> {
        return veiculosStore.get(id) ?? null;
    }

    async findByPlaca(placa: { value: string }): Promise<Veiculo | null> {
        return (
            Array.from(veiculosStore.values()).find(
                (veiculo) => veiculo.placa.value === placa.value
            ) ?? null
        );
    }

    async save(veiculo: Veiculo): Promise<Veiculo> {
        const id = new ObjectId().toString();
        const saved = new Veiculo(
            veiculo.placa,
            veiculo.modelo,
            veiculo.ano,
            veiculo.marca,
            id
        );
        veiculosStore.set(id, saved);
        return saved;
    }

    async update(id: string, veiculo: Veiculo): Promise<Veiculo | null> {
        if (!veiculosStore.has(id)) {
            return null;
        }
        veiculosStore.set(id, veiculo);
        return veiculo;
    }

    async delete(id: string): Promise<boolean> {
        return veiculosStore.delete(id);
    }
}

class InMemoryOrdemServicoGateway implements IOrdemServicoGateway {
    async findAll(): Promise<OrdemServico[]> {
        return Array.from(ordensStore.values());
    }

    async findById(id: string): Promise<OrdemServico | null> {
        return ordensStore.get(id) ?? null;
    }

    async findByCpfCnpj(cpfCnpj: string): Promise<OrdemServico[]> {
        return Array.from(ordensStore.values()).filter(
            (ordem) => ordem.cpfCnpj.value === cpfCnpj
        );
    }

    async save(ordem: OrdemServico): Promise<OrdemServico> {
        const id = new ObjectId().toString();
        const saved = OrdemServico.restore({
            id,
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
        });
        ordensStore.set(id, saved);
        return saved;
    }

    async update(id: string, ordem: Partial<OrdemServico>): Promise<OrdemServico | null> {
        const existing = ordensStore.get(id);
        if (!existing) {
            return null;
        }

        const updated = OrdemServico.restore({
            id,
            cpfCnpj: ordem.cpfCnpj?.value ?? existing.cpfCnpj.value,
            veiculoId: ordem.veiculoId?.value ?? existing.veiculoId.value,
            status: ordem.status?.value ?? existing.status.value,
            dataAbertura: ordem.dataAbertura ?? existing.dataAbertura,
            pecas: (ordem.pecas ?? existing.pecas).map((item) => ({
                pecaId: item.pecaId.value,
                quantidade: item.quantidade,
                valorUnitario: item.valorUnitario,
            })),
            servicos: ordem.servicos ?? existing.servicos,
            valorTotal: ordem.valorTotal ?? existing.valorTotal,
        });
        ordensStore.set(id, updated);
        return updated;
    }
}

const container = DIContainer.getInstance();
container.injectClienteGateway(new InMemoryClienteGateway());
container.injectVeiculoGateway(new InMemoryVeiculoGateway());
container.injectOrdemServicoGateway(new InMemoryOrdemServicoGateway());
container.injectExecucaoServicoPort({
    createExecucoesParaServicos: jest.fn().mockResolvedValue(undefined),
});

import app from '../../app';
import { Email } from '../../src/enterprise/value-objects/email.vo';
import { Documento } from '../../src/enterprise/value-objects/documento.vo';
import { Placa } from '../../src/enterprise/value-objects/placa.vo';

describe('Integração - Rotas de Ordens de Serviço', () => {
    let _token: string;
    let veiculoId: string;

    beforeAll(async () => {
        _token = await getAuthToken();

        clientesStore.set('cliente-1', new Cliente(
            'Cliente Teste',
            Email.from('cliente@teste.com'),
            Documento.from('11144477735'),
            '11999999999',
            'cliente-1'
        ));

        veiculoId = new ObjectId().toString();
        veiculosStore.set(veiculoId, new Veiculo(
            Placa.from('ABC1D23'),
            'Gol',
            2020,
            'Volkswagen',
            veiculoId
        ));
    });

    afterEach(() => {
        ordensStore.clear();
    });

    test('deve retornar 400 quando cliente ou veículo não forem informados', async () => {
        const response = await request(app)
            .post('/api/ordensServico')
            .send({ status: 'RECEBIDA' })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(400);
    });

    test('deve criar ordem de serviço com sucesso', async () => {
        const response = await request(app)
            .post('/api/ordensServico')
            .send({
                cpfCnpj: '11144477735',
                veiculoId,
                pecas: [],
                servicos: [],
            })
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe('RECEBIDA');
        expect(response.body.veiculoId).toBe(veiculoId);
    });

    test('deve listar ordens de serviço', async () => {
        await request(app)
            .post('/api/ordensServico')
            .send({
                cpfCnpj: '11144477735',
                veiculoId,
                pecas: [],
                servicos: [],
            })
            .auth(_token, { type: 'bearer' });

        const response = await request(app)
            .get('/api/ordensServico')
            .auth(_token, { type: 'bearer' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });
});
