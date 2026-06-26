import { ObjectId } from 'mongodb';
import { Orcamento } from '../../src/enterprise/entities/orcamento.entity';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { TipoItem } from '../../src/validators/tipo-item';
import { IOrcamentoGateway } from '../../src/application/ports/orcamento.gateway.port';
import { CriarOrcamentoPendenteUseCase } from '../../src/application/usecases/orcamento/criar-orcamento-pendente.usecase';
import { AtualizarOrcamentoUseCase } from '../../src/application/usecases/orcamento/atualizar-orcamento.usecase';
import { VerificarUltimoOrcamentoAprovadoUseCase } from '../../src/application/usecases/orcamento/verificar-ultimo-orcamento-aprovado.usecase';

describe('Orcamento use cases', () => {
    let gateway: jest.Mocked<IOrcamentoGateway>;

    beforeEach(() => {
        gateway = {
            save: jest.fn(),
            findById: jest.fn(),
            findByOrdemServicoId: jest.fn(),
            update: jest.fn(),
        };
    });

    test('criar orcamento pendente salva snapshot de pecas e servicos', async () => {
        gateway.save.mockImplementation(async (orcamento) =>
            Orcamento.restore({ ...serializeOrcamento(orcamento), id: new ObjectId().toString() })
        );

        const useCase = new CriarOrcamentoPendenteUseCase(gateway);
        const ordemServicoId = new ObjectId().toString();

        await useCase.execute({
            ordemServicoId,
            valorTotal: 195,
            pecas: [
                {
                    id: new ObjectId().toString(),
                    nome: 'Filtro',
                    descricao: 'Filtro de oleo',
                    preco: 45,
                    tipo: TipoItem.PECA,
                    quantidade: 1,
                },
            ],
            servicos: [
                {
                    id: new ObjectId().toString(),
                    nome: 'Troca de Oleo',
                    descricao: 'Servico completo',
                    preco: 150,
                },
            ],
        });

        expect(gateway.save).toHaveBeenCalledWith(
            expect.objectContaining({
                ordemServicoId,
                versao: 1,
                valorTotal: 195,
                status: expect.objectContaining({ value: 'PENDENTE' }),
            })
        );
    });

    test('atualizar orcamento retorna null quando nao existe', async () => {
        gateway.findById.mockResolvedValue(null);

        const useCase = new AtualizarOrcamentoUseCase(gateway);
        const result = await useCase.execute(new ObjectId().toString(), { status: 'APROVADO' });

        expect(result).toBeNull();
    });

    test('atualizar orcamento valida status invalido', async () => {
        const orcamento = Orcamento.createPendente({
            ordemServicoId: new ObjectId().toString(),
            pecas: [],
            servicos: [],
            valorTotal: 0,
        });

        gateway.findById.mockResolvedValue(orcamento);

        const useCase = new AtualizarOrcamentoUseCase(gateway);

        await expect(useCase.execute(new ObjectId().toString(), { status: 'INVALIDO' })).rejects.toThrow(
            'Status inválido'
        );
    });

    test('verificar ultimo orcamento aprovado considera maior versao', async () => {
        const ordemServicoId = new ObjectId().toString();

        gateway.findByOrdemServicoId.mockResolvedValue([
            Orcamento.restore({
                ordemServicoId,
                versao: 1,
                status: 'APROVADO',
                pecas: [],
                itensServicos: [],
                valorTotal: 100,
                validadeEm: new Date(),
                criadoEm: new Date(),
            }),
            Orcamento.restore({
                ordemServicoId,
                versao: 2,
                status: 'PENDENTE',
                pecas: [],
                itensServicos: [],
                valorTotal: 120,
                validadeEm: new Date(),
                criadoEm: new Date(),
            }),
        ]);

        const useCase = new VerificarUltimoOrcamentoAprovadoUseCase(gateway);
        const result = await useCase.execute(ordemServicoId);

        expect(result).toBe(false);
    });
});

function serializeOrcamento(orcamento: Orcamento) {
    return {
        ordemServicoId: orcamento.ordemServicoId,
        versao: orcamento.versao,
        status: orcamento.status.value,
        pecas: orcamento.pecas,
        itensServicos: orcamento.itensServicos,
        valorTotal: orcamento.valorTotal,
        validadeEm: orcamento.validadeEm,
        criadoEm: orcamento.criadoEm,
    };
}
