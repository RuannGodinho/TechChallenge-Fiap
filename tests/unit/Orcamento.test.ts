import { Orcamento } from '../../src/enterprise/entities/orcamento.entity';
import { Servico } from '../../src/enterprise/entities/servico.entity';
import { Peca } from '../../src/enterprise/entities/peca.entity';
import { TipoItem } from '../../src/validators/tipo-item';

describe('Orcamento', () => {
  test('deve criar instância de Orcamento com todos os atributos', () => {
    const ordemServicoId = '507f1f77bcf86cd799439011';
    const peca = new Peca('Filtro de Óleo', 'Filtro para troca de óleo', 45.00, TipoItem.PECA);
    const servico = new Servico('Troca de Óleo', 'Troca completa com filtro', 150.00);
    const validadeEm = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const criadoEm = new Date();

    const orcamento = Orcamento.createPendente({
      ordemServicoId,
      pecas: [peca],
      servicos: [servico],
      valorTotal: 195.00,
      validadeEm,
      criadoEm,
    });

    expect(orcamento).toBeInstanceOf(Orcamento);
    expect(orcamento.ordemServicoId).toEqual(ordemServicoId);
    expect(orcamento.versao).toBe(1);
    expect(orcamento.status.value).toBe('PENDENTE');
    expect(orcamento.pecas).toHaveLength(1);
    expect(orcamento.itensServicos).toHaveLength(1);
    expect(orcamento.valorTotal).toBe(195.00);
    expect(orcamento.validadeEm).toEqual(validadeEm);
    expect(orcamento.criadoEm).toEqual(criadoEm);
  });

  test('deve inicializar com todos os statuses válidos via restore', () => {
    const statuses = ['PENDENTE', 'APROVADO', 'REPROVADO', 'EXPIRADO'];
    const ordemServicoId = '507f1f77bcf86cd799439011';

    statuses.forEach(status => {
      const orcamento = Orcamento.restore({
        ordemServicoId,
        versao: 1,
        status,
        pecas: [],
        itensServicos: [],
        valorTotal: 0,
        validadeEm: new Date(),
        criadoEm: new Date(),
      });

      expect(orcamento.status.value).toBe(status);
    });
  });

  test('deve rejeitar status inválido', () => {
    expect(() =>
      Orcamento.restore({
        ordemServicoId: '507f1f77bcf86cd799439011',
        versao: 1,
        status: 'INVALIDO',
        pecas: [],
        itensServicos: [],
        valorTotal: 0,
        validadeEm: new Date(),
        criadoEm: new Date(),
      })
    ).toThrow('Status inválido');
  });
});
