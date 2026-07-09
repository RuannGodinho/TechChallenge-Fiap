import { ObjectId } from 'mongodb';
import { PecaLookupAdapter } from '../../src/Adapters/adapters/peca-lookup.adapter';
import { ServicoLookupAdapter } from '../../src/Adapters/adapters/servico-lookup.adapter';
import { EstoqueMovimentacaoAdapter } from '../../src/Adapters/adapters/estoque-movimentacao.adapter';
import { OrcamentoPortAdapter } from '../../src/Adapters/adapters/orcamento.port.adapter';
import { ExecucaoServicoPortAdapter } from '../../src/Adapters/adapters/execucao-servico.port.adapter';
import { BuscarPecaPorIdUseCase } from '../../src/application/usecases/peca/buscar-peca-por-id.usecase';
import { BuscarServicoPorIdUseCase } from '../../src/application/usecases/servico/buscar-servico-por-id.usecase';
import { BuscarEstoquePorPecaIdUseCase } from '../../src/application/usecases/estoque/buscar-estoque-por-peca-id.usecase';
import { RegistrarMovimentacaoEstoqueUseCase } from '../../src/application/usecases/estoque/registrar-movimentacao-estoque.usecase';
import { CriarOrcamentoPendenteUseCase } from '../../src/application/usecases/orcamento/criar-orcamento-pendente.usecase';
import { VerificarUltimoOrcamentoAprovadoUseCase } from '../../src/application/usecases/orcamento/verificar-ultimo-orcamento-aprovado.usecase';
import { CriarExecucoesParaServicosUseCase } from '../../src/application/usecases/execucao-servico/criar-execucoes-para-servicos.usecase';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { Estoque } from '../../src/enterprise/entities/estoque.entity';
import { TipoItem } from '../../src/validators/tipo-item';
import { PecaId } from '../../src/enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../src/enterprise/value-objects/quantidade.vo';

describe('Port adapters', () => {
    const pecaId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    test('PecaLookupAdapter mapeia peça encontrada', async () => {
        const peca = new Peca('Filtro', 'Filtro de óleo', 30, TipoItem.PECA, pecaId);
        const useCase = { execute: jest.fn().mockResolvedValue(peca) } as unknown as BuscarPecaPorIdUseCase;
        const adapter = new PecaLookupAdapter(useCase);

        await expect(adapter.findById(pecaId)).resolves.toEqual({
            id: pecaId,
            nome: 'Filtro',
            descricao: 'Filtro de óleo',
            preco: 30,
            tipo: TipoItem.PECA,
        });
    });

    test('PecaLookupAdapter retorna null quando peça não existe', async () => {
        const useCase = { execute: jest.fn().mockResolvedValue(null) } as unknown as BuscarPecaPorIdUseCase;
        const adapter = new PecaLookupAdapter(useCase);

        await expect(adapter.findById(pecaId)).resolves.toBeNull();
    });

    test('ServicoLookupAdapter mapeia serviço encontrado', async () => {
        const servico = new Servico('Alinhamento', 'Alinhamento completo', 120, servicoId);
        const useCase = { execute: jest.fn().mockResolvedValue(servico) } as unknown as BuscarServicoPorIdUseCase;
        const adapter = new ServicoLookupAdapter(useCase);

        await expect(adapter.findById(servicoId)).resolves.toEqual({
            id: servicoId,
            nome: 'Alinhamento',
            descricao: 'Alinhamento completo',
            preco: 120,
        });
    });

    test('EstoqueMovimentacaoAdapter valida quantidade disponível', async () => {
        const estoque = new Estoque(PecaId.from(pecaId), Quantidade.from(5));
        const buscar = { execute: jest.fn().mockResolvedValue(estoque) } as unknown as BuscarEstoquePorPecaIdUseCase;
        const registrar = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as RegistrarMovimentacaoEstoqueUseCase;
        const adapter = new EstoqueMovimentacaoAdapter(buscar, registrar);

        await adapter.assertQuantidadeDisponivel(pecaId, 3);
        await adapter.registrarSaidaOS(pecaId, 2);

        expect(registrar.execute).toHaveBeenCalledWith(
            expect.objectContaining({ pecaId, tipo: 'SAIDA', origem: 'OS', quantidade: 2 })
        );
    });

    test('EstoqueMovimentacaoAdapter rejeita estoque insuficiente', async () => {
        const estoque = new Estoque(PecaId.from(pecaId), Quantidade.from(1));
        const buscar = { execute: jest.fn().mockResolvedValue(estoque) } as unknown as BuscarEstoquePorPecaIdUseCase;
        const registrar = { execute: jest.fn() } as unknown as RegistrarMovimentacaoEstoqueUseCase;
        const adapter = new EstoqueMovimentacaoAdapter(buscar, registrar);

        await expect(adapter.assertQuantidadeDisponivel(pecaId, 5)).rejects.toThrow(
            'Quantidade insuficiente em estoque'
        );
    });

    test('OrcamentoPortAdapter delega para use cases', async () => {
        const criar = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as CriarOrcamentoPendenteUseCase;
        const verificar = { execute: jest.fn().mockResolvedValue(true) } as unknown as VerificarUltimoOrcamentoAprovadoUseCase;
        const adapter = new OrcamentoPortAdapter(criar, verificar);

        await adapter.createPendente({
            ordemServicoId: 'ordem-1',
            valorTotal: 100,
            pecas: [],
            servicos: [],
        });
        await expect(adapter.isLatestOrcamentoApproved('ordem-1')).resolves.toBe(true);

        expect(criar.execute).toHaveBeenCalled();
        expect(verificar.execute).toHaveBeenCalledWith('ordem-1');
    });

    test('ExecucaoServicoPortAdapter delega criação de execuções', async () => {
        const useCase = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as CriarExecucoesParaServicosUseCase;
        const adapter = new ExecucaoServicoPortAdapter(useCase);

        await adapter.createExecucoesParaServicos('ordem-1', [servicoId]);

        expect(useCase.execute).toHaveBeenCalledWith({ ordemServicoId: 'ordem-1', servicoIds: [servicoId] });
    });
});
