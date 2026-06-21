import { CriarPecaUseCase } from '../../src/application/usecases/peca/criar-peca.usecase';
import { BuscarPecaPorIdUseCase } from '../../src/application/usecases/peca/buscar-peca-por-id.usecase';
import { AtualizarPecaUseCase } from '../../src/application/usecases/peca/atualizar-peca.usecase';
import { DeletarPecaUseCase } from '../../src/application/usecases/peca/deletar-peca.usecase';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { TipoItem } from '../../src/validators/tipo-item';
import { IPecaGateway } from '../../src/application/ports/peca.gateway.port';
import { ObjectId } from 'mongodb';

describe('Peca use cases', () => {
    let gateway: jest.Mocked<IPecaGateway>;
    let criarPecaUseCase: CriarPecaUseCase;
    let buscarPecaPorIdUseCase: BuscarPecaPorIdUseCase;
    let atualizarPecaUseCase: AtualizarPecaUseCase;
    let deletarPecaUseCase: DeletarPecaUseCase;

    beforeEach(() => {
        gateway = {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            save: jest.fn(async (peca: Peca) => peca),
            update: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(false),
        };

        criarPecaUseCase = new CriarPecaUseCase(gateway);
        buscarPecaPorIdUseCase = new BuscarPecaPorIdUseCase(gateway);
        atualizarPecaUseCase = new AtualizarPecaUseCase(gateway);
        deletarPecaUseCase = new DeletarPecaUseCase(gateway);
    });

    test('deve criar peça válida com sucesso', async () => {
        gateway.save.mockImplementation(async (peca) =>
            new Peca(peca.nome, peca.descricao, peca.preco, peca.tipo, 'generated-id')
        );

        const peca = await criarPecaUseCase.execute({
            nome: 'Disco de Freio',
            descricao: 'Disco dianteiro',
            tipo: 'PECA',
            preco: 199.9,
        });

        expect(gateway.save).toHaveBeenCalled();
        expect(peca.nome).toBe('Disco de Freio');
    });

    test('deve rejeitar criação de peça com tipo inválido', async () => {
        await expect(
            criarPecaUseCase.execute({
                nome: 'Óleo',
                descricao: 'Óleo para motor',
                tipo: 'COMBUSTIVEL',
                preco: 79.9,
            })
        ).rejects.toThrow('Tipo inválido. Use PECA ou INSUMO');

        expect(gateway.save).not.toHaveBeenCalled();
    });

    test('deve retornar null ao atualizar peça inexistente', async () => {
        const result = await atualizarPecaUseCase.execute('missing-id', { nome: 'Novo nome' });

        expect(result).toBeNull();
        expect(gateway.update).not.toHaveBeenCalled();
    });

    test('deve atualizar peça existente com dados válidos', async () => {
        const existing = new Peca('Parafuso', 'Parafuso M8', 4.5, TipoItem.PECA, 'existing-id');
        gateway.findById.mockResolvedValue(existing);
        gateway.update.mockImplementation(async (_id, peca) => peca);

        const result = await atualizarPecaUseCase.execute('existing-id', {
            preco: 5.5,
            tipo: 'INSUMO',
        });

        expect(result).toMatchObject({
            nome: 'Parafuso',
            descricao: 'Parafuso M8',
            preco: 5.5,
            tipo: 'INSUMO',
        });
        expect(gateway.update).toHaveBeenCalled();
    });

    test('deve rejeitar atualização com tipo inválido', async () => {
        const existing = new Peca('Parafuso', 'Parafuso M8', 4.5, TipoItem.PECA, 'existing-id');
        gateway.findById.mockResolvedValue(existing);

        await expect(
            atualizarPecaUseCase.execute('existing-id', { tipo: 'INVALIDO' })
        ).rejects.toThrow('Tipo inválido. Use PECA ou INSUMO');

        expect(gateway.update).not.toHaveBeenCalled();
    });

    test('deve retornar false ao deletar peça inexistente', async () => {
        const deleted = await deletarPecaUseCase.execute(new ObjectId().toString());

        expect(deleted).toBe(false);
        expect(gateway.delete).not.toHaveBeenCalled();
    });

    test('deve deletar peça existente', async () => {
        const existing = new Peca('Bateria', 'Bateria 12V', 299.9, TipoItem.INSUMO, 'existing-id');
        gateway.findById.mockResolvedValue(existing);
        gateway.delete.mockResolvedValue(true);

        const deleted = await deletarPecaUseCase.execute('existing-id');

        expect(deleted).toBe(true);
        expect(gateway.delete).toHaveBeenCalledWith('existing-id');
    });

    test('deve buscar peça por id', async () => {
        const existing = new Peca('Disco', 'Disco dianteiro', 199.9, TipoItem.PECA, 'any-id');
        gateway.findById.mockResolvedValue(existing);

        const peca = await buscarPecaPorIdUseCase.execute('any-id');

        expect(peca?.nome).toBe('Disco');
    });
});
