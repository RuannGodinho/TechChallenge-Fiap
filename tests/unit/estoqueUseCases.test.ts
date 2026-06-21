import { ObjectId } from 'mongodb';
import { RegistrarMovimentacaoEstoqueUseCase } from '../../src/application/usecases/estoque/registrar-movimentacao-estoque.usecase';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { Estoque } from '../../src/enterprise/entities/estoque.entity';
import { TipoItem } from '../../src/validators/tipo-item';
import { IEstoqueGateway } from '../../src/application/ports/estoque.gateway.port';
import { IMovimentacaoEstoqueGateway } from '../../src/application/ports/movimentacao-estoque.gateway.port';
import { IPecaGateway } from '../../src/application/ports/peca.gateway.port';
import { PecaId } from '../../src/enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../src/enterprise/value-objects/quantidade.vo';

describe('Estoque use cases', () => {
    let pecaGateway: jest.Mocked<IPecaGateway>;
    let estoqueGateway: jest.Mocked<IEstoqueGateway>;
    let movimentacaoGateway: jest.Mocked<IMovimentacaoEstoqueGateway>;
    let registrarMovimentacaoUseCase: RegistrarMovimentacaoEstoqueUseCase;

    const pecaId = new ObjectId().toString();
    const peca = new Peca('Parafuso', 'Parafuso M8', 4.5, TipoItem.PECA, pecaId);

    beforeEach(() => {
        pecaGateway = {
            findAll: jest.fn(),
            findById: jest.fn().mockResolvedValue(peca),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        estoqueGateway = {
            findAll: jest.fn(),
            findByPecaId: jest.fn().mockResolvedValue(null),
            save: jest.fn(async (estoque) => estoque),
        };

        movimentacaoGateway = {
            findAll: jest.fn(),
            save: jest.fn(async (movimentacao) => movimentacao),
        };

        registrarMovimentacaoUseCase = new RegistrarMovimentacaoEstoqueUseCase(
            estoqueGateway,
            movimentacaoGateway,
            pecaGateway
        );
    });

    test('deve registrar entrada quando peça existe e não havia estoque', async () => {
        const movimentacao = await registrarMovimentacaoUseCase.execute({
            pecaId,
            tipo: 'ENTRADA',
            quantidade: 10,
            data: new Date(),
            origem: 'compra',
        });

        expect(movimentacao.tipo.value).toBe('ENTRADA');
        expect(estoqueGateway.save).toHaveBeenCalledWith(
            expect.objectContaining({
                pecaId: PecaId.from(pecaId),
                quantidade: Quantidade.from(10),
            })
        );
        expect(movimentacaoGateway.save).toHaveBeenCalled();
    });

    test('deve registrar saída quando há estoque suficiente', async () => {
        estoqueGateway.findByPecaId.mockResolvedValue(
            Estoque.restore(PecaId.from(pecaId), Quantidade.from(10))
        );

        const movimentacao = await registrarMovimentacaoUseCase.execute({
            pecaId,
            tipo: 'SAIDA',
            quantidade: 4,
            data: new Date(),
            origem: 'ordem',
        });

        expect(movimentacao.tipo.value).toBe('SAIDA');
        expect(estoqueGateway.save).toHaveBeenCalledWith(
            expect.objectContaining({
                quantidade: Quantidade.from(6),
            })
        );
        expect(movimentacaoGateway.save).toHaveBeenCalled();
    });

    test('deve rejeitar saída quando não há estoque', async () => {
        await expect(
            registrarMovimentacaoUseCase.execute({
                pecaId,
                tipo: 'SAIDA',
                quantidade: 1,
                data: new Date(),
                origem: 'ordem',
            })
        ).rejects.toThrow('Não há estoque para a peça especificada');

        expect(movimentacaoGateway.save).not.toHaveBeenCalled();
    });

    test('deve rejeitar movimentação quando peça não existe', async () => {
        pecaGateway.findById.mockResolvedValue(null);

        await expect(
            registrarMovimentacaoUseCase.execute({
                pecaId,
                tipo: 'ENTRADA',
                quantidade: 3,
                data: new Date(),
                origem: 'compra',
            })
        ).rejects.toThrow('Peça não encontrada para a movimentação de estoque');

        expect(movimentacaoGateway.save).not.toHaveBeenCalled();
    });
});
