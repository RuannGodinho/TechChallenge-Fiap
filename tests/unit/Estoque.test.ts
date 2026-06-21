import { ObjectId } from 'mongodb';
import { Estoque } from '../../src/enterprise/entities/estoque.entity';
import { PecaId } from '../../src/enterprise/value-objects/peca-id.vo';
import { Quantidade } from '../../src/enterprise/value-objects/quantidade.vo';
import { TipoMovimentacao } from '../../src/enterprise/value-objects/tipo-movimentacao.vo';
import { OrigemMovimentacao } from '../../src/enterprise/value-objects/origem-movimentacao.vo';

describe('Estoque entity', () => {
    const pecaId = PecaId.from(new ObjectId().toString());
    const data = new Date();

    test('deve registrar entrada em estoque inicial', () => {
        const estoque = Estoque.inicial(pecaId);

        const { estoque: atualizado, movimentacao } = estoque.registrarMovimentacao({
            tipo: TipoMovimentacao.from('ENTRADA'),
            quantidade: Quantidade.from(10),
            data,
            origem: OrigemMovimentacao.from('compra'),
        });

        expect(atualizado.quantidade.value).toBe(10);
        expect(movimentacao.quantidade.value).toBe(10);
        expect(estoque.isPersisted()).toBe(false);
        expect(atualizado.isPersisted()).toBe(false);
    });

    test('deve registrar saída após entrada em estoque ainda não persistido', () => {
        const { estoque: comEntrada } = Estoque.inicial(pecaId).registrarMovimentacao({
            tipo: TipoMovimentacao.from('ENTRADA'),
            quantidade: Quantidade.from(10),
            data,
            origem: OrigemMovimentacao.from('compra'),
        });

        expect(comEntrada.isPersisted()).toBe(false);
        expect(comEntrada.quantidade.value).toBe(10);

        const { estoque: aposSaida } = comEntrada.registrarMovimentacao({
            tipo: TipoMovimentacao.from('SAIDA'),
            quantidade: Quantidade.from(4),
            data,
            origem: OrigemMovimentacao.from('ordem'),
        });

        expect(aposSaida.quantidade.value).toBe(6);
    });

    test('deve registrar saída quando há estoque suficiente', () => {
        const estoque = Estoque.restore(pecaId, Quantidade.from(10));

        const { estoque: atualizado } = estoque.registrarMovimentacao({
            tipo: TipoMovimentacao.from('SAIDA'),
            quantidade: Quantidade.from(4),
            data,
            origem: OrigemMovimentacao.from('OS'),
        });

        expect(atualizado.quantidade.value).toBe(6);
    });

    test('deve rejeitar saída sem estoque', () => {
        const estoque = Estoque.inicial(pecaId);

        expect(() =>
            estoque.registrarMovimentacao({
                tipo: TipoMovimentacao.from('SAIDA'),
                quantidade: Quantidade.from(1),
                data,
                origem: OrigemMovimentacao.from('ordem'),
            })
        ).toThrow('Não há estoque para a peça especificada');
    });
});
