import { Orcamento } from '../../src/Entities/orcamento';
import { Servico } from '../../src/Entities/servico';
import { Peca } from '../../src/Entities/Estoque/peca';
import { TipoItem } from '../../src/validators/tipo-item';
import { ObjectId } from 'mongodb';

describe('Orcamento', () => {
  test('deve criar instância de Orcamento com todos os atributos', () => {
    const ordemServicoId = new ObjectId();
    const peca = new Peca('Filtro de Óleo', 'Filtro para troca de óleo', 45.00, TipoItem.PECA);
    const servico = new Servico('Troca de Óleo', 'Troca completa com filtro', 150.00);
    const validadeEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const criadoEm = new Date();

    const orcamento = new Orcamento(
      ordemServicoId,
      1,
      'PENDENTE',
      [peca],
      [servico],
      195.00,
      validadeEm,
      criadoEm
    );

    expect(orcamento).toBeInstanceOf(Orcamento);
    expect(orcamento.ordemServicoId).toEqual(ordemServicoId);
    expect(orcamento.versao).toBe(1);
    expect(orcamento.status).toBe('PENDENTE');
    expect(orcamento.pecas).toHaveLength(1);
    expect(orcamento.itensServicos).toHaveLength(1);
    expect(orcamento.valorTotal).toBe(195.00);
    expect(orcamento.validadeEm).toEqual(validadeEm);
    expect(orcamento.criadoEm).toEqual(criadoEm);
  });

  test('deve inicializar com todos os statuses válidos', () => {
    const statuses = ['PENDENTE', 'APROVADO', 'REPROVADO', 'EXPIRADO'];
    const ordemServicoId = new ObjectId();

    statuses.forEach(status => {
      const orcamento = new Orcamento(
        ordemServicoId,
        1,
        status as any,
        [],
        [],
        0,
        new Date(),
        new Date()
      );
      expect(orcamento.status).toBe(status);
    });
  });

  test('deve permitir múltiplas peças no orçamento', () => {
    const peca1 = new Peca('Filtro', 'Filtro de óleo', 45.00, TipoItem.PECA);
    const peca2 = new Peca('Vela', 'Vela de ignição', 25.00, TipoItem.INSUMO);

    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [peca1, peca2],
      [],
      70.00,
      new Date(),
      new Date()
    );

    expect(orcamento.pecas).toHaveLength(2);
    expect(orcamento.valorTotal).toBe(70.00);
  });

  test('deve permitir múltiplos serviços no orçamento', () => {
    const servico1 = new Servico('Troca de Óleo', 'Troca completa', 150.00);
    const servico2 = new Servico('Alinhamento', 'Alinhamento completo', 200.00);

    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [],
      [servico1, servico2],
      350.00,
      new Date(),
      new Date()
    );

    expect(orcamento.itensServicos).toHaveLength(2);
    expect(orcamento.valorTotal).toBe(350.00);
  });

  test('deve permitir incremento de versão', () => {
    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [],
      [],
      100.00,
      new Date(),
      new Date()
    );

    expect(orcamento.versao).toBe(1);

    orcamento.versao = 2;
    expect(orcamento.versao).toBe(2);
  });

  test('deve calcular valor total corretamente', () => {
    const peca = new Peca('Peça', 'Descrição', 50.00, TipoItem.PECA);
    const servico = new Servico('Serviço', 'Descrição', 150.00);

    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [peca],
      [servico],
      200.00,
      new Date(),
      new Date()
    );

    expect(orcamento.valorTotal).toBe(200.00);
  });

  test('deve validar transição de status de PENDENTE para APROVADO', () => {
    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [],
      [],
      100.00,
      new Date(),
      new Date()
    );

    expect(orcamento.status).toBe('PENDENTE');

    orcamento.status = 'APROVADO';
    expect(orcamento.status).toBe('APROVADO');
  });

  test('deve permitir orçamento com apenas peças', () => {
    const peca = new Peca('Peça', 'Descrição', 75.00, TipoItem.PECA);

    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [peca],
      [],
      75.00,
      new Date(),
      new Date()
    );

    expect(orcamento.pecas).toHaveLength(1);
    expect(orcamento.itensServicos).toHaveLength(0);
  });

  test('deve permitir orçamento com apenas serviços', () => {
    const servico = new Servico('Serviço', 'Descrição', 100.00);

    const orcamento = new Orcamento(
      new ObjectId(),
      1,
      'PENDENTE',
      [],
      [servico],
      100.00,
      new Date(),
      new Date()
    );

    expect(orcamento.pecas).toHaveLength(0);
    expect(orcamento.itensServicos).toHaveLength(1);
  });
});
