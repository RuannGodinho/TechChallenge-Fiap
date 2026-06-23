import { ObjectId } from 'mongodb';
import { CriarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/criar-ordem-servico.usecase';
import { ListarOrdensServicoUseCase } from '../../src/application/usecases/ordem-servico/listar-ordens-servico.usecase';
import { AtualizarOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-ordem-servico.usecase';
import { BuscarOrdensPorCpfCnpjUseCase } from '../../src/application/usecases/ordem-servico/buscar-ordens-por-cpf-cnpj.usecase';
import { AlterarStatusOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/alterar-status-ordem-servico.usecase';
import { AtualizarItensOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/atualizar-itens-ordem-servico.usecase';
import { ObterDetalhesOrdemServicoUseCase } from '../../src/application/usecases/ordem-servico/obter-detalhes-ordem-servico.usecase';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { IOrdemServicoGateway } from '../../src/application/ports/ordem-servico.gateway.port';
import { IClienteLookupPort } from '../../src/application/ports/cliente-lookup.port';
import { IVeiculoLookupPort } from '../../src/application/ports/veiculo-lookup.port';
import { IExecucaoServicoPort } from '../../src/application/ports/execucao-servico.port';

describe('OrdemServico use cases', () => {
    let ordemGateway: jest.Mocked<IOrdemServicoGateway>;
    let clienteLookup: jest.Mocked<IClienteLookupPort>;
    let veiculoLookup: jest.Mocked<IVeiculoLookupPort>;
    let execucaoPort: jest.Mocked<IExecucaoServicoPort>;
    let criarOrdemServicoUseCase: CriarOrdemServicoUseCase;
    let listarOrdensServicoUseCase: ListarOrdensServicoUseCase;
    let alterarStatusUseCase: jest.Mocked<AlterarStatusOrdemServicoUseCase>;
    let atualizarItensUseCase: jest.Mocked<AtualizarItensOrdemServicoUseCase>;
    let atualizarOrdemServicoUseCase: AtualizarOrdemServicoUseCase;
    let obterDetalhesUseCase: jest.Mocked<ObterDetalhesOrdemServicoUseCase>;
    let buscarOrdensPorCpfUseCase: BuscarOrdensPorCpfCnpjUseCase;

    const veiculoId = new ObjectId().toString();

    beforeEach(() => {
        ordemGateway = {
            findAll: jest.fn().mockResolvedValue([]),
            findById: jest.fn().mockResolvedValue(null),
            findByCpfCnpj: jest.fn().mockResolvedValue([]),
            save: jest.fn(async (ordem: OrdemServico) =>
                OrdemServico.restore({
                    id: 'generated-id',
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
                })
            ),
            update: jest.fn().mockResolvedValue(null),
        };

        clienteLookup = {
            existsByCpf: jest.fn().mockResolvedValue(true),
        };

        veiculoLookup = {
            existsById: jest.fn().mockResolvedValue(true),
        };

        execucaoPort = {
            createExecucoesParaServicos: jest.fn().mockResolvedValue(undefined),
        };

        criarOrdemServicoUseCase = new CriarOrdemServicoUseCase(
            ordemGateway,
            clienteLookup,
            veiculoLookup,
            execucaoPort
        );

        listarOrdensServicoUseCase = new ListarOrdensServicoUseCase(ordemGateway);

        alterarStatusUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<AlterarStatusOrdemServicoUseCase>;

        atualizarItensUseCase = {
            execute: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<AtualizarItensOrdemServicoUseCase>;

        atualizarOrdemServicoUseCase = new AtualizarOrdemServicoUseCase(
            ordemGateway,
            clienteLookup,
            veiculoLookup,
            execucaoPort,
            alterarStatusUseCase,
            atualizarItensUseCase
        );

        obterDetalhesUseCase = {
            execute: jest.fn().mockResolvedValue({
                ordem: OrdemServico.create({ cpfCnpj: '11144477735', veiculoId }),
                veiculo: null,
                pecas: [],
                servicos: [],
            }),
        } as unknown as jest.Mocked<ObterDetalhesOrdemServicoUseCase>;

        buscarOrdensPorCpfUseCase = new BuscarOrdensPorCpfCnpjUseCase(
            ordemGateway,
            obterDetalhesUseCase
        );
    });

    test('deve criar ordem de serviço válida', async () => {
        const servicoId = new ObjectId().toString();

        const ordem = await criarOrdemServicoUseCase.execute({
            cpfCnpj: '11144477735',
            veiculoId,
            servicos: [servicoId],
        });

        expect(ordem.id).toBe('generated-id');
        expect(ordem.status.value).toBe('RECEBIDA');
        expect(ordemGateway.save).toHaveBeenCalled();
        expect(execucaoPort.createExecucoesParaServicos).toHaveBeenCalledWith('generated-id', [
            servicoId,
        ]);
    });

    test('deve rejeitar criação quando cliente não existe', async () => {
        clienteLookup.existsByCpf.mockResolvedValue(false);

        await expect(
            criarOrdemServicoUseCase.execute({
                cpfCnpj: '11144477735',
                veiculoId,
            })
        ).rejects.toThrow('Cliente não encontrado para o CPF/CNPJ fornecido.');

        expect(ordemGateway.save).not.toHaveBeenCalled();
    });

    test('deve rejeitar criação quando veículo não existe', async () => {
        veiculoLookup.existsById.mockResolvedValue(false);

        await expect(
            criarOrdemServicoUseCase.execute({
                cpfCnpj: '11144477735',
                veiculoId,
            })
        ).rejects.toThrow('Veículo não encontrado para o ID fornecido.');

        expect(ordemGateway.save).not.toHaveBeenCalled();
    });

    test('deve listar ordens de serviço', async () => {
        const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });
        ordemGateway.findAll.mockResolvedValue([ordem]);

        const ordens = await listarOrdensServicoUseCase.execute();

        expect(ordens).toHaveLength(1);
        expect(ordens[0].status.value).toBe('RECEBIDA');
    });

    test('deve atualizar ordem de serviço existente', async () => {
        const ordemId = 'ordem-1';
        const ordem = OrdemServico.restore({
            id: ordemId,
            cpfCnpj: '11144477735',
            veiculoId,
            status: 'RECEBIDA',
            dataAbertura: new Date(),
            pecas: [],
            servicos: [],
        });

        ordemGateway.findById.mockResolvedValue(ordem);
        ordemGateway.update.mockResolvedValue(
            OrdemServico.restore({
                id: ordemId,
                cpfCnpj: '11144477735',
                veiculoId,
                status: 'EM DIAGNOSTICO',
                dataAbertura: ordem.dataAbertura,
                pecas: [],
                servicos: [],
            })
        );

        const updated = await atualizarOrdemServicoUseCase.execute(ordemId, {
            status: 'EM DIAGNOSTICO',
        });

        expect(updated.status.value).toBe('EM DIAGNOSTICO');
        expect(alterarStatusUseCase.execute).toHaveBeenCalled();
        expect(ordemGateway.update).toHaveBeenCalled();
    });

    test('deve rejeitar atualização quando ordem não existe', async () => {
        ordemGateway.findById.mockResolvedValue(null);

        await expect(
            atualizarOrdemServicoUseCase.execute('missing-id', { status: 'EM DIAGNOSTICO' })
        ).rejects.toThrow('Ordem de serviço não encontrada');
    });

    test('deve buscar ordens por CPF/CNPJ com detalhes', async () => {
        const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });
        ordemGateway.findByCpfCnpj.mockResolvedValue([ordem]);

        const detalhes = await buscarOrdensPorCpfUseCase.execute('11144477735');

        expect(detalhes).toHaveLength(1);
        expect(obterDetalhesUseCase.execute).toHaveBeenCalledWith(ordem);
    });

    test('deve rejeitar busca por CPF/CNPJ sem ordens', async () => {
        ordemGateway.findByCpfCnpj.mockResolvedValue([]);

        await expect(buscarOrdensPorCpfUseCase.execute('11144477735')).rejects.toThrow(
            'Ordem de serviço não encontrada'
        );
    });
});
