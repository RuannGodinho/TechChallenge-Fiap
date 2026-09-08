import { ObjectId } from 'mongodb';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { ObterDetalhesOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/obter-detalhes-ordem-servico.usecase';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { IOrcamentoPort } from '../../src/application/ports/orcamento.port';
import { IEstoqueMovimentacaoPort } from '../../src/application/ports/estoque-movimentacao.port';
import { IPecaLookupPort } from '../../src/application/ports/peca-lookup.port';
import { IServicoLookupPort } from '../../src/application/ports/servico-lookup.port';
import { BuscarVeiculoPorIdUseCase } from '../../src/application/usecases/veiculo/buscar-veiculo-por-id.usecase';
import { createObservabilityMock } from '../Helper/observability';
import { BusinessEvent, BusinessReason } from '../../src/application/observability/business-events';

describe('OrdemServico extended use cases', () => {
    const veiculoId = new ObjectId().toString();
    const pecaId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    describe('AlterarStatusOrdemServicoUseCase', () => {
        let orcamentoPort: jest.Mocked<IOrcamentoPort>;
        let estoquePort: jest.Mocked<IEstoqueMovimentacaoPort>;
        let observability: ReturnType<typeof createObservabilityMock>;
        let useCase: AlterarStatusOrdemServicoUseCase;

        beforeEach(() => {
            orcamentoPort = {
                createPendente: jest.fn(),
                isLatestOrcamentoApproved: jest.fn().mockResolvedValue(true),
            };
            estoquePort = {
                assertQuantidadeDisponivel: jest.fn().mockResolvedValue(undefined),
                registrarSaidaOS: jest.fn().mockResolvedValue(undefined),
            };
            observability = createObservabilityMock();
            useCase = new AlterarStatusOrdemServicoUseCase(
                orcamentoPort,
                estoquePort,
                observability
            );
        });

        test('deve transicionar para status simples sem validar estoque', async () => {
            const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });

            await useCase.execute(ordem, 'EM DIAGNOSTICO');

            expect(ordem.status.value).toBe('EM DIAGNOSTICO');
            expect(estoquePort.assertQuantidadeDisponivel).not.toHaveBeenCalled();
            expect(observability.emit).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: BusinessEvent.osStatusChanged,
                    from: 'RECEBIDA',
                    to: 'EM DIAGNOSTICO',
                })
            );
        });

        test('deve validar estoque e orçamento ao iniciar execução', async () => {
            const ordem = OrdemServico.restore({
                id: 'ordem-1',
                cpfCnpj: '11144477735',
                veiculoId,
                status: 'AGUARDANDO APROVACAO',
                dataAbertura: new Date(),
                pecas: [{ pecaId, quantidade: 2, valorUnitario: 10 }],
                servicos: [servicoId],
            });

            await useCase.execute(ordem, 'EM EXECUCAO');

            expect(estoquePort.assertQuantidadeDisponivel).toHaveBeenCalledWith(pecaId, 2);
            expect(estoquePort.registrarSaidaOS).toHaveBeenCalledWith(pecaId, 2);
            expect(orcamentoPort.isLatestOrcamentoApproved).toHaveBeenCalledWith('ordem-1');
            expect(ordem.status.value).toBe('EM EXECUCAO');
            expect(observability.emit).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: BusinessEvent.estoqueMovimentado,
                    pecaId,
                    quantidade: 2,
                    origem: 'OS',
                })
            );
            expect(observability.emit).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: BusinessEvent.osStatusChanged,
                    from: 'AGUARDANDO APROVACAO',
                    to: 'EM EXECUCAO',
                })
            );
        });

        test('deve rejeitar início de execução sem orçamento aprovado', async () => {
            orcamentoPort.isLatestOrcamentoApproved.mockResolvedValue(false);
            const ordem = OrdemServico.restore({
                id: 'ordem-1',
                cpfCnpj: '11144477735',
                veiculoId,
                status: 'AGUARDANDO APROVACAO',
                dataAbertura: new Date(),
                pecas: [{ pecaId, quantidade: 1, valorUnitario: 10 }],
                servicos: [],
            });

            await expect(useCase.execute(ordem, 'EM EXECUCAO')).rejects.toThrow(
                'Não é possível iniciar a execução da Ordem de Serviço se o orcamento não estiver aprovado.'
            );
            expect(estoquePort.registrarSaidaOS).not.toHaveBeenCalled();
            expect(observability.emit).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: BusinessEvent.osProcessingFailed,
                    alert: true,
                    reason: BusinessReason.orcamentoNaoAprovado,
                    ordemServicoId: 'ordem-1',
                })
            );
        });

        test('deve emitir falha quando transição for ilegal', async () => {
            const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });

            await expect(useCase.execute(ordem, 'EM EXECUCAO')).rejects.toThrow(
                'Não é permitido alterar status de RECEBIDA para EM EXECUCAO'
            );
            expect(estoquePort.registrarSaidaOS).not.toHaveBeenCalled();
            expect(orcamentoPort.isLatestOrcamentoApproved).not.toHaveBeenCalled();
            expect(observability.emit).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: BusinessEvent.osProcessingFailed,
                    alert: true,
                    reason: BusinessReason.illegalTransition,
                    from: 'RECEBIDA',
                    to: 'EM EXECUCAO',
                })
            );
        });
    });

    describe('AtualizarItensOrdemServicoUseCase', () => {
        let pecaLookup: jest.Mocked<IPecaLookupPort>;
        let servicoLookup: jest.Mocked<IServicoLookupPort>;
        let estoquePort: jest.Mocked<IEstoqueMovimentacaoPort>;
        let orcamentoPort: jest.Mocked<IOrcamentoPort>;
        let useCase: AtualizarItensOrdemServicoUseCase;

        beforeEach(() => {
            pecaLookup = {
                findById: jest.fn().mockResolvedValue({
                    id: pecaId,
                    nome: 'Filtro',
                    descricao: 'Filtro de óleo',
                    preco: 35,
                    tipo: 'PECA',
                }),
            };
            servicoLookup = {
                findById: jest.fn().mockResolvedValue({
                    id: servicoId,
                    nome: 'Troca de óleo',
                    descricao: 'Serviço completo',
                    preco: 100,
                }),
            };
            estoquePort = {
                assertQuantidadeDisponivel: jest.fn().mockResolvedValue(undefined),
                registrarSaidaOS: jest.fn(),
            };
            orcamentoPort = {
                createPendente: jest.fn().mockResolvedValue(undefined),
                isLatestOrcamentoApproved: jest.fn(),
            };
            useCase = new AtualizarItensOrdemServicoUseCase(
                pecaLookup,
                servicoLookup,
                estoquePort,
                orcamentoPort,
                createObservabilityMock()
            );
        });

        test('deve ignorar quando não há itens para atualizar', async () => {
            const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });

            await useCase.execute(ordem, { pecas: [], servicos: [] });

            expect(pecaLookup.findById).not.toHaveBeenCalled();
            expect(orcamentoPort.createPendente).not.toHaveBeenCalled();
        });

        test('deve atualizar itens e criar orçamento pendente em diagnóstico', async () => {
            const ordem = OrdemServico.restore({
                id: 'ordem-1',
                cpfCnpj: '11144477735',
                veiculoId,
                status: 'EM DIAGNOSTICO',
                dataAbertura: new Date(),
                pecas: [],
                servicos: [],
            });

            await useCase.execute(ordem, {
                pecas: [{ pecaId, quantidade: 2 }],
                servicos: [servicoId],
            });

            expect(ordem.pecas).toHaveLength(1);
            expect(ordem.servicos).toEqual([servicoId]);
            expect(ordem.valorTotal).toBe(170);
            expect(orcamentoPort.createPendente).toHaveBeenCalled();
            expect(ordem.status.value).toBe('AGUARDANDO APROVACAO');
        });

        test('deve rejeitar peça inexistente', async () => {
            pecaLookup.findById.mockResolvedValue(null);
            const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });

            await expect(
                useCase.execute(ordem, {
                    pecas: [{ pecaId, quantidade: 1 }],
                    servicos: [servicoId],
                })
            ).rejects.toThrow(`Peça não encontrada para o ID ${pecaId}`);
        });

        test('deve rejeitar serviço inexistente', async () => {
            servicoLookup.findById.mockResolvedValue(null);
            const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });

            await expect(
                useCase.execute(ordem, {
                    pecas: [{ pecaId, quantidade: 1 }],
                    servicos: [servicoId],
                })
            ).rejects.toThrow(`Serviço não encontrado para o ID ${servicoId}`);
        });
    });

    describe('ObterDetalhesOrdemServicoUseCase', () => {
        test('deve montar detalhes com veículo, peças e serviços', async () => {
            const veiculo = Veiculo.create('ABC1D23', 'Gol', 2020, 'Volkswagen');
            Object.assign(veiculo, { id: veiculoId });

            const buscarVeiculo = {
                execute: jest.fn().mockResolvedValue(veiculo),
            } as unknown as BuscarVeiculoPorIdUseCase;

            const pecaLookup: IPecaLookupPort = {
                findById: jest.fn().mockResolvedValue({
                    id: pecaId,
                    nome: 'Pastilha',
                    descricao: 'Pastilha dianteira',
                    preco: 50,
                    tipo: 'PECA',
                }),
            };

            const servicoLookup: IServicoLookupPort = {
                findById: jest.fn().mockResolvedValue({
                    id: servicoId,
                    nome: 'Freios',
                    descricao: 'Troca de pastilhas',
                    preco: 120,
                }),
            };

            const useCase = new ObterDetalhesOrdemServicoUseCase(
                buscarVeiculo,
                pecaLookup,
                servicoLookup
            );

            const ordem = OrdemServico.restore({
                id: 'ordem-1',
                cpfCnpj: '11144477735',
                veiculoId,
                status: 'RECEBIDA',
                dataAbertura: new Date(),
                pecas: [{ pecaId, quantidade: 1, valorUnitario: 50 }],
                servicos: [servicoId],
                valorTotal: 170,
            });

            const detalhes = await useCase.execute(ordem);

            expect(detalhes.veiculo).toBe(veiculo);
            expect(detalhes.pecas).toHaveLength(1);
            expect(detalhes.servicos).toHaveLength(1);
            expect(detalhes.ordem.valorTotal).toBe(170);
        });
    });
});
