import { Peca } from '../../src/enterprise/entities/peca.entity';
import { TipoItem } from '../../src/validators/tipo-item';

describe('Peca entity', () => {
    test('deve criar peça válida', () => {
        const peca = Peca.create('Disco', 'Disco dianteiro', 199.9, 'PECA');

        expect(peca.nome).toBe('Disco');
        expect(peca.tipo).toBe(TipoItem.PECA);
    });

    test('deve normalizar tipo para maiúsculas', () => {
        const peca = Peca.create('Óleo', 'Óleo motor', 49.9, 'insumo');

        expect(peca.tipo).toBe(TipoItem.INSUMO);
    });

    test('deve rejeitar tipo inválido', () => {
        expect(() => Peca.create('Item', 'Descrição', 10, 'INVALIDO')).toThrow(
            'Tipo inválido. Use PECA ou INSUMO'
        );
    });

    test('deve rejeitar nome vazio', () => {
        expect(() => Peca.create('', 'Descrição', 10, 'PECA')).toThrow('Nome é obrigatório');
    });

    test('deve rejeitar preço negativo', () => {
        expect(() => Peca.create('Item', 'Descrição', -1, 'PECA')).toThrow('Preço inválido');
    });
});
