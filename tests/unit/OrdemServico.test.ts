import { OrdemServico } from '../../src/Entities/ordem-servico';
import { ObjectId } from 'mongodb';
import { OrdemPecaItem } from '../../src/ValueObjects/ordem-peca-item';

describe('OrdemServico', () => {
  test('deve criar instância de OrdemServico com todos os atributos', () => {
    const clienteId = '11144477735';
    const veiculoId = new ObjectId();
    const pecaItem = new OrdemPecaItem(new ObjectId(), 2, 150.00);
    const servicoId = new ObjectId();
    const dataAbertura = new Date();

    const ordemServico = new OrdemServico(
      clienteId,
      veiculoId,
      'RECEBIDA',
      dataAbertura,
      [pecaItem],
      [servicoId]
    );

    expect(ordemServico).toBeInstanceOf(OrdemServico);
    expect(ordemServico.cpfCnpj).toBe(clienteId);
    expect(ordemServico.veiculo).toEqual(veiculoId);
    expect(ordemServico.status).toBe('RECEBIDA');
    expect(ordemServico.dataAbertura).toEqual(dataAbertura);
    expect(ordemServico.pecas).toHaveLength(1);
    expect(ordemServico.servicos).toHaveLength(1);
  });

  test('deve inicializar com status válido', () => {
    const statuses = [
      'RECEBIDA',
      'EM DIAGNOSTICO',
      'AGUARDANDO APROVACAO',
      'EM EXECUCAO',
      'FINALIZADA',
      'ENTREGUE'
    ];

    statuses.forEach(status => {
      const os = new OrdemServico(
        '11144477735',
        new ObjectId(),
        status as any,
        new Date(),
        [],
        []
      );
      expect(os.status).toBe(status);
    });
  });

  test('deve permitir datas opcionais (dataInicioServico e dataFechamento)', () => {
    const ordemServico = new OrdemServico(
      '11144477735',
      new ObjectId(),
      'RECEBIDA',
      new Date(),
      [],
      []
    );

    expect(ordemServico.dataInicioServico).toBeUndefined();
    expect(ordemServico.dataFechamento).toBeUndefined();

    ordemServico.dataInicioServico = new Date();
    ordemServico.dataFechamento = new Date();

    expect(ordemServico.dataInicioServico).toBeDefined();
    expect(ordemServico.dataFechamento).toBeDefined();
  });

  test('deve permitir valorTotal opcional', () => {
    const ordemServico = new OrdemServico(
      '11144477735',
      new ObjectId(),
      'FINALIZADA',
      new Date(),
      [],
      []
    );

    expect(ordemServico.valorTotal).toBeUndefined();

    ordemServico.valorTotal = 500.00;
    expect(ordemServico.valorTotal).toBe(500.00);
  });

  test('deve inicializar pecas e servicos vazios se não fornecidos', () => {
    const ordemServico = new OrdemServico(
      '11144477735',
      new ObjectId(),
      'RECEBIDA',
      new Date(),
      [],
      []
    );

    expect(ordemServico.pecas).toEqual([]);
    expect(ordemServico.servicos).toEqual([]);
  });
});
