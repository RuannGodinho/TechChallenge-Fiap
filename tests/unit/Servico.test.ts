import { Servico } from '../../src/Entities/Servico';

describe('Servico', () => {
  test('deve criar instância de Servico com todos os atributos', () => {
    const servico = new Servico('Troca de óleo', 'Troca de óleo completo com filtro', 249.99);

    expect(servico).toBeInstanceOf(Servico);
    expect(servico.nome).toBe('Troca de óleo');
    expect(servico.descricao).toBe('Troca de óleo completo com filtro');
    expect(servico.preco).toBe(249.99);
  });
});
