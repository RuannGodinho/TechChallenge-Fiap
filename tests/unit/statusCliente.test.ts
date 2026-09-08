import { StatusCliente } from '../../src/enterprise/value-objects/status-cliente.vo';

describe('StatusCliente', () => {
    test('aceita ATIVO e INATIVO', () => {
        expect(StatusCliente.from('ativo').isAtivo()).toBe(true);
        expect(StatusCliente.from('INATIVO').isAtivo()).toBe(false);
    });

    test('rejeita status desconhecido', () => {
        expect(() => StatusCliente.from('BLOQUEADO')).toThrow('Status do cliente inválido');
    });
});
