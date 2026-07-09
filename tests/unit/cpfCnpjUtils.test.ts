import { formatCpfCnpj, normalizeCpfCnpj } from '../../src/utils/cpf-cnpj-utils';

describe('cpf-cnpj-utils', () => {
    const validCpf = '11144477735';
    const validCnpj = '11222333000181';

    test('normalizeCpfCnpj deve identificar CPF válido', () => {
        const result = normalizeCpfCnpj(validCpf);

        expect(result.type).toBe('CPF');
        expect(result.stripped).toBe(validCpf);
        expect(result.formatted).toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    });

    test('normalizeCpfCnpj deve identificar CNPJ válido', () => {
        const result = normalizeCpfCnpj(validCnpj);

        expect(result.type).toBe('CNPJ');
        expect(result.stripped).toBe(validCnpj);
        expect(result.formatted).toMatch(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/);
    });

    test('normalizeCpfCnpj deve rejeitar documento inválido', () => {
        expect(() => normalizeCpfCnpj('00000000000')).toThrow('CPF/CNPJ inválido');
    });

    test('formatCpfCnpj deve formatar CPF válido', () => {
        expect(formatCpfCnpj(validCpf)).toBe('111.444.777-35');
    });

    test('formatCpfCnpj deve formatar CNPJ válido', () => {
        expect(formatCpfCnpj(validCnpj)).toBe('11.222.333/0001-81');
    });

    test('formatCpfCnpj deve retornar valor original quando inválido', () => {
        expect(formatCpfCnpj('invalido')).toBe('invalido');
    });
});
