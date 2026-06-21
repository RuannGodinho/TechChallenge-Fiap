import { CriarServicoUseCase } from '../../src/application/usecases/servico/criar-servico.usecase';
import { BuscarServicoPorIdUseCase } from '../../src/application/usecases/servico/buscar-servico-por-id.usecase';
import { AtualizarServicoUseCase } from '../../src/application/usecases/servico/atualizar-servico.usecase';
import { DeletarServicoUseCase } from '../../src/application/usecases/servico/deletar-servico.usecase';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { IServicoGateway } from '../../src/application/ports/servico.gateway.port';

describe('Servico use cases', () => {
    let gateway: jest.Mocked<IServicoGateway>;
    let criarServicoUseCase: CriarServicoUseCase;
    let buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase;
    let atualizarServicoUseCase: AtualizarServicoUseCase;
    let deletarServicoUseCase: DeletarServicoUseCase;

    beforeEach(() => {
        gateway = {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            save: jest.fn(async (servico: Servico) => servico),
            update: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(false),
        };

        criarServicoUseCase = new CriarServicoUseCase(gateway);
        buscarServicoPorIdUseCase = new BuscarServicoPorIdUseCase(gateway);
        atualizarServicoUseCase = new AtualizarServicoUseCase(gateway);
        deletarServicoUseCase = new DeletarServicoUseCase(gateway);
    });

    test('deve criar serviço válido com sucesso', async () => {
        gateway.save.mockImplementation(async (servico) =>
            new Servico(servico.nome, servico.descricao, servico.preco, 'generated-id')
        );

        const servico = await criarServicoUseCase.execute({
            nome: 'Troca de óleo',
            descricao: 'Troca completa',
            preco: 249.99,
        });

        expect(gateway.save).toHaveBeenCalled();
        expect(servico.nome).toBe('Troca de óleo');
    });

    test('deve rejeitar criação com nome vazio', async () => {
        await expect(
            criarServicoUseCase.execute({
                nome: '',
                descricao: 'Descrição',
                preco: 100,
            })
        ).rejects.toThrow('Nome é obrigatório');

        expect(gateway.save).not.toHaveBeenCalled();
    });

    test('deve retornar null ao atualizar serviço inexistente', async () => {
        const result = await atualizarServicoUseCase.execute('missing-id', { nome: 'Novo nome' });

        expect(result).toBeNull();
        expect(gateway.update).not.toHaveBeenCalled();
    });

    test('deve atualizar serviço existente', async () => {
        const existing = new Servico('Troca de óleo', 'Descrição', 249.99, 'existing-id');
        gateway.findById.mockResolvedValue(existing);
        gateway.update.mockImplementation(async (_id, servico) => servico);

        const result = await atualizarServicoUseCase.execute('existing-id', { preco: 299.99 });

        expect(result?.preco).toBe(299.99);
        expect(gateway.update).toHaveBeenCalled();
    });

    test('deve retornar false ao deletar serviço inexistente', async () => {
        const deleted = await deletarServicoUseCase.execute('missing-id');

        expect(deleted).toBe(false);
        expect(gateway.delete).not.toHaveBeenCalled();
    });

    test('deve deletar serviço existente', async () => {
        const existing = new Servico('Alinhamento', 'Alinhamento 3D', 120, 'existing-id');
        gateway.findById.mockResolvedValue(existing);
        gateway.delete.mockResolvedValue(true);

        const deleted = await deletarServicoUseCase.execute('existing-id');

        expect(deleted).toBe(true);
        expect(gateway.delete).toHaveBeenCalledWith('existing-id');
    });

    test('deve buscar serviço por id', async () => {
        const existing = new Servico('Balanceamento', 'Balanceamento de rodas', 80, 'any-id');
        gateway.findById.mockResolvedValue(existing);

        const servico = await buscarServicoPorIdUseCase.execute('any-id');

        expect(servico?.nome).toBe('Balanceamento');
    });
});
