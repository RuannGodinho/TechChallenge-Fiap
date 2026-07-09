import { ObjectId } from 'mongodb';
import { OrdemServicoPresenter } from '../../src/Adapters/presenters/ordem-servico.presenter';
import { OrcamentoPresenter } from '../../src/Adapters/presenters/orcamento.presenter';
import { ExecucaoServicoPresenter } from '../../src/Adapters/presenters/execucao-servico.presenter';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { Orcamento } from '../../src/enterprise/entities/orcamento.entity';
import { ExecucaoServico } from '../../src/enterprise/entities/execucao-servico.entity';
import { Veiculo } from '../../src/enterprise/entities/veiculo.entity';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { TipoItem } from '../../src/validators/tipo-item';

describe('Presenters', () => {
    const veiculoId = new ObjectId().toString();
    const pecaId = new ObjectId().toString();
    const servicoId = new ObjectId().toString();

    test('OrdemServicoPresenter formata ordem e detalhes', () => {
        const presenter = new OrdemServicoPresenter();
        const ordem = OrdemServico.restore({
            id: 'ordem-1',
            cpfCnpj: '11144477735',
            veiculoId,
            status: 'RECEBIDA',
            dataAbertura: new Date('2024-01-01'),
            pecas: [{ pecaId, quantidade: 2, valorUnitario: 15 }],
            servicos: [servicoId],
            valorTotal: 130,
        });

        const response = presenter.present(ordem);
        expect(response.id).toBe('ordem-1');
        expect(response.valorTotal).toBe(130);
        expect(response.pecas[0].pecaId).toBe(pecaId);

        const veiculo = Veiculo.create('ABC1D23', 'Gol', 2020, 'Volkswagen');
        const peca = new Peca('Pastilha', 'Pastilha dianteira', 50, TipoItem.PECA, pecaId, 2);
        const servico = new Servico('Freios', 'Troca', 80, servicoId, 1);

        const detalhes = presenter.presentDetalhes({
            ordem,
            veiculo,
            pecas: [{ item: ordem.pecas[0], peca: { id: pecaId, nome: peca.nome, descricao: peca.descricao, preco: peca.preco, tipo: peca.tipo } }],
            servicos: [{ id: servicoId, nome: servico.nome, descricao: servico.descricao, preco: servico.preco }],
        });

        expect(detalhes.veiculo?.placa).toBe('ABC1D23');
        expect(detalhes.pecas[0].subtotal).toBe(30);
        expect(presenter.presentList([ordem])).toHaveLength(1);
        expect(presenter.presentDetalhesList([{ ordem, veiculo: null, pecas: [], servicos: [] }])).toHaveLength(1);
    });

    test('OrcamentoPresenter formata orçamento com peças e serviços', () => {
        const presenter = new OrcamentoPresenter();
        const peca = new Peca('Óleo', '5W30', 40, TipoItem.INSUMO, pecaId, 3);
        const servico = new Servico('Troca', 'Troca de óleo', 90, servicoId, 1);
        const orcamento = Orcamento.createPendente({
            ordemServicoId: new ObjectId().toString(),
            pecas: [peca],
            servicos: [servico],
            valorTotal: 210,
        });

        const response = presenter.present(orcamento);
        expect(response.pecas[0].quantidade).toBe(3);
        expect(response.itensServicos[0].id).toBe(servicoId);
        expect(presenter.presentList([orcamento])).toHaveLength(1);
    });

    test('ExecucaoServicoPresenter formata execução com datas', () => {
        const presenter = new ExecucaoServicoPresenter();
        const iniciadoEm = new Date('2024-06-01T10:00:00');
        const finalizadoEm = new Date('2024-06-01T11:00:00');
        const execucao = ExecucaoServico.restore({
            id: 'exec-1',
            ordemServicoId: 'ordem-1',
            servicoId,
            status: 'FINALIZADO',
            criadoEm: new Date('2024-06-01T09:00:00'),
            iniciadoEm,
            finalizadoEm,
        });

        const response = presenter.present(execucao);
        expect(response.iniciadoEm).toEqual(iniciadoEm);
        expect(response.finalizadoEm).toEqual(finalizadoEm);
        expect(presenter.presentList([execucao])).toHaveLength(1);
    });
});
