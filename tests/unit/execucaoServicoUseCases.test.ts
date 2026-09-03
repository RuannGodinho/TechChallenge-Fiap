import { ObjectId } from 'mongodb';
import { ExecucaoServico } from '../../src/enterprise/entities/execucao-servico.entity';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { StatusOSValues } from '../../src/enterprise/value-objects/status-os.vo';
import { IExecucaoServicoGateway } from '../../src/application/ports/execucao-servico.gateway.port';
import { IOrdemServicoGateway } from '../../src/application/ports/ordem-servico.gateway.port';
import { IServicoLookupPort } from '../../src/application/ports/servico-lookup.port';
import { CriarExecucoesParaServicosUseCase } from '../../src/application/usecases/execucao-servico/criar-execucoes-para-servicos.usecase';
import { IniciarExecucaoUseCase } from '../../src/application/usecases/execucao-servico/iniciar-execucao.usecase';
import { FinalizarExecucaoUseCase } from '../../src/application/usecases/execucao-servico/finalizar-execucao.usecase';
import { ObterTempoMedioServicosUseCase } from '../../src/application/usecases/execucao-servico/obter-tempo-medio-servicos.usecase';
import { createObservabilityMock } from '../Helper/observability';
import { BusinessEvent, BusinessReason } from '../../src/application/observability/business-events';

describe('ExecucaoServico use cases', () => {
    let execucaoGateway: jest.Mocked<IExecucaoServicoGateway>;
    let ordemGateway: jest.Mocked<IOrdemServicoGateway>;
    let servicoLookup: jest.Mocked<IServicoLookupPort>;
    let observability: ReturnType<typeof createObservabilityMock>;
    let criarExecucoesUseCase: CriarExecucoesParaServicosUseCase;
    let iniciarExecucaoUseCase: IniciarExecucaoUseCase;
    let finalizarExecucaoUseCase: FinalizarExecucaoUseCase;
    let obterTempoMedioUseCase: ObterTempoMedioServicosUseCase;

    const ordemId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    beforeEach(() => {
        execucaoGateway = {
            save: jest.fn(),
            saveMany: jest.fn().mockResolvedValue(undefined),
            findById: jest.fn().mockResolvedValue(null),
            findByOrdemServicoId: jest.fn().mockResolvedValue([]),
            findFinalizadas: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue(null),
        };

        ordemGateway = {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCpfCnpj: jest.fn(),
            save: jest.fn(),
            update: jest.fn().mockResolvedValue(null),
        };

        servicoLookup = {
            findById: jest.fn().mockResolvedValue({
                id: servicoId,
                nome: 'Serviço',
                descricao: 'Descrição',
                preco: 100,
            }),
        };

        criarExecucoesUseCase = new CriarExecucoesParaServicosUseCase(
            execucaoGateway,
            ordemGateway,
            servicoLookup
        );
        observability = createObservabilityMock();
        iniciarExecucaoUseCase = new IniciarExecucaoUseCase(
            execucaoGateway,
            ordemGateway,
            observability
        );
        finalizarExecucaoUseCase = new FinalizarExecucaoUseCase(
            execucaoGateway,
            ordemGateway,
            observability
        );
        obterTempoMedioUseCase = new ObterTempoMedioServicosUseCase(execucaoGateway);
    });

    test('deve criar execuções pendentes para serviços novos', async () => {
        ordemGateway.findById.mockResolvedValue(
            OrdemServico.create({ cpfCnpj: '11144477735', veiculoId: new ObjectId().toString() })
        );

        await criarExecucoesUseCase.execute({ ordemServicoId: ordemId, servicoIds: [servicoId] });

        expect(execucaoGateway.saveMany).toHaveBeenCalledWith([
            expect.objectContaining({
                ordemServicoId: ordemId,
                servicoId,
            }),
        ]);
        const saved = execucaoGateway.saveMany.mock.calls[0][0][0];
        expect(saved.status.value).toBe('PENDENTE');
    });

    test('deve ignorar serviços que já possuem execução', async () => {
        ordemGateway.findById.mockResolvedValue(
            OrdemServico.create({ cpfCnpj: '11144477735', veiculoId: new ObjectId().toString() })
        );
        execucaoGateway.findByOrdemServicoId.mockResolvedValue([
            ExecucaoServico.create(ordemId, servicoId),
        ]);

        await criarExecucoesUseCase.execute({ ordemServicoId: ordemId, servicoIds: [servicoId] });

        expect(execucaoGateway.saveMany).not.toHaveBeenCalled();
    });

    test('deve iniciar execução quando OS estiver em execução', async () => {
        const execucao = ExecucaoServico.create(ordemId, servicoId);
        execucao.id = 'exec-1';

        execucaoGateway.findById.mockResolvedValue(execucao);
        ordemGateway.findById.mockResolvedValue(
            OrdemServico.restore({
                id: ordemId,
                cpfCnpj: '11144477735',
                veiculoId: new ObjectId().toString(),
                status: StatusOSValues.EM_EXECUCAO,
                dataAbertura: new Date(),
                pecas: [],
                servicos: [servicoId],
            })
        );
        execucaoGateway.update.mockResolvedValue(
            ExecucaoServico.restore({
                id: 'exec-1',
                ordemServicoId: ordemId,
                servicoId,
                status: 'EM EXECUCAO',
                criadoEm: execucao.criadoEm,
                iniciadoEm: new Date(),
            })
        );

        const result = await iniciarExecucaoUseCase.execute('exec-1');

        expect(result.status.value).toBe('EM EXECUCAO');
        expect(execucaoGateway.update).toHaveBeenCalled();
        expect(observability.emit).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: BusinessEvent.execucaoStarted,
                execucaoId: 'exec-1',
                ordemServicoId: ordemId,
            })
        );
    });

    test('deve rejeitar iniciar execução quando OS não estiver em execução', async () => {
        const execucao = ExecucaoServico.create(ordemId, servicoId);
        execucao.id = 'exec-1';

        execucaoGateway.findById.mockResolvedValue(execucao);
        ordemGateway.findById.mockResolvedValue(
            OrdemServico.restore({
                id: ordemId,
                cpfCnpj: '11144477735',
                veiculoId: new ObjectId().toString(),
                status: StatusOSValues.RECEBIDA,
                dataAbertura: new Date(),
                pecas: [],
                servicos: [servicoId],
            })
        );

        await expect(iniciarExecucaoUseCase.execute('exec-1')).rejects.toThrow(
            'Não é possível iniciar a execução de um serviço se a Ordem de Serviço não estiver em execução.'
        );
        expect(observability.emit).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: BusinessEvent.osProcessingFailed,
                alert: true,
                reason: BusinessReason.execucaoOsNotInExecution,
                execucaoId: 'exec-1',
                ordemServicoId: ordemId,
            })
        );
    });

    test('deve rejeitar iniciar execução já iniciada', async () => {
        execucaoGateway.findById.mockResolvedValue(
            ExecucaoServico.restore({
                id: 'exec-1',
                ordemServicoId: ordemId,
                servicoId,
                status: 'EM EXECUCAO',
                criadoEm: new Date(),
                iniciadoEm: new Date(),
            })
        );

        await expect(iniciarExecucaoUseCase.execute('exec-1')).rejects.toThrow('Execução já iniciada.');
    });

    test('deve finalizar execução e atualizar OS quando todas estiverem finalizadas', async () => {
        const execucao = ExecucaoServico.restore({
            id: 'exec-1',
            ordemServicoId: ordemId,
            servicoId,
            status: 'EM EXECUCAO',
            criadoEm: new Date(),
            iniciadoEm: new Date(),
        });

        execucaoGateway.findById.mockResolvedValue(execucao);
        execucaoGateway.update.mockResolvedValue(
            ExecucaoServico.restore({
                id: 'exec-1',
                ordemServicoId: ordemId,
                servicoId,
                status: 'FINALIZADO',
                criadoEm: execucao.criadoEm,
                iniciadoEm: execucao.iniciadoEm,
                finalizadoEm: new Date(),
            })
        );
        execucaoGateway.findByOrdemServicoId.mockResolvedValue([
            ExecucaoServico.restore({
                id: 'exec-1',
                ordemServicoId: ordemId,
                servicoId,
                status: 'FINALIZADO',
                criadoEm: execucao.criadoEm,
                iniciadoEm: execucao.iniciadoEm,
                finalizadoEm: new Date(),
            }),
        ]);
        ordemGateway.findById.mockResolvedValue(
            OrdemServico.restore({
                id: ordemId,
                cpfCnpj: '11144477735',
                veiculoId: new ObjectId().toString(),
                status: StatusOSValues.EM_EXECUCAO,
                dataAbertura: new Date(),
                pecas: [],
                servicos: [servicoId],
            })
        );
        ordemGateway.update.mockImplementation(async (_id, ordem) => ordem as OrdemServico);

        const result = await finalizarExecucaoUseCase.execute('exec-1');

        expect(result.status.value).toBe('FINALIZADO');
        expect(ordemGateway.update).toHaveBeenCalledWith(
            ordemId,
            expect.objectContaining({
                status: expect.objectContaining({ value: StatusOSValues.FINALIZADA }),
            })
        );
        expect(observability.emit).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: BusinessEvent.osAutoFinalized,
                ordemServicoId: ordemId,
            })
        );
        expect(observability.emit).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: BusinessEvent.osStatusChanged,
                from: StatusOSValues.EM_EXECUCAO,
                to: StatusOSValues.FINALIZADA,
            })
        );
    });

    test('deve calcular métricas de tempo médio corretamente', async () => {
        const agora = new Date();
        execucaoGateway.findFinalizadas.mockResolvedValue([
            ExecucaoServico.restore({
                ordemServicoId: ordemId,
                servicoId,
                status: 'FINALIZADO',
                criadoEm: agora,
                iniciadoEm: new Date(agora.getTime() - 30 * 60000),
                finalizadoEm: agora,
            }),
            ExecucaoServico.restore({
                ordemServicoId: ordemId,
                servicoId: new ObjectId().toString(),
                status: 'FINALIZADO',
                criadoEm: agora,
                iniciadoEm: new Date(agora.getTime() - 60 * 60000),
                finalizadoEm: agora,
            }),
        ]);

        const metrics = await obterTempoMedioUseCase.execute();

        expect(metrics.totalServicosFinalizados).toBe(2);
        expect(metrics.tempoMedioMinutos).toBe(45);
        expect(metrics.maisRapidoMinutos).toBe(30);
        expect(metrics.maisLentoMinutos).toBe(60);
    });
});
