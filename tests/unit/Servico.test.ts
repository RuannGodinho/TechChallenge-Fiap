import { Servico } from '../../src/enterprise/entities/servico.entity';

describe('Servico entity', () => {
    test('deve criar instância de Servico com todos os atributos', () => {
        const servico = new Servico('Troca de óleo', 'Troca de óleo completo com filtro', 249.99);

        expect(servico).toBeInstanceOf(Servico);
        expect(servico.nome).toBe('Troca de óleo');
        expect(servico.descricao).toBe('Troca de óleo completo com filtro');
        expect(servico.preco).toBe(249.99);
    });

    test('deve criar serviço via factory', () => {
        const servico = Servico.create('Alinhamento', 'Alinhamento 3D', 120);

        expect(servico.nome).toBe('Alinhamento');
        expect(servico.preco).toBe(120);
    });

    test('deve rejeitar preço negativo', () => {
        expect(() => Servico.create('Serviço', 'Descrição', -1)).toThrow('Preço inválido');
    });

    test('deve rejeitar descrição vazia', () => {
        expect(() => Servico.create('Serviço', '', 100)).toThrow('Descrição é obrigatória');
    });
});
