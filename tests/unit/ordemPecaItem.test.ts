import { OrdemPecaItem } from '../../src/enterprise/value-objects/ordem-peca-item.vo';
import { ObjectId } from 'mongodb';

describe('OrdemPecaItem', () => {
    const pecaId = new ObjectId().toString();

    test('deve criar item válido', () => {
        const item = OrdemPecaItem.create(pecaId, 2, 15.5);

        expect(item.pecaId.value).toBe(pecaId);
        expect(item.quantidade).toBe(2);
        expect(item.valorUnitario).toBe(15.5);
    });

    test('deve rejeitar quantidade inválida', () => {
        expect(() => OrdemPecaItem.create(pecaId, 0, 10)).toThrow('Quantidade inválida');
        expect(() => OrdemPecaItem.create(pecaId, 1.5, 10)).toThrow('Quantidade inválida');
    });

    test('deve rejeitar valor unitário negativo', () => {
        expect(() => OrdemPecaItem.create(pecaId, 1, -1)).toThrow('Valor unitário inválido');
    });

    test('deve restaurar item persistido', () => {
        const item = OrdemPecaItem.restore(pecaId, 3, 20);

        expect(item.quantidade).toBe(3);
        expect(item.valorUnitario).toBe(20);
    });
});
