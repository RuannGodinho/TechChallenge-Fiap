import { PlacaValidator } from '../../src/validators/PlacaValidator';

describe('PlacaValidator', () => {
  test('deve validar placas no formato antigo', () => {
    expect(PlacaValidator.isValid('ABC1234')).toBe(true);
    expect(PlacaValidator.isValid('abc-1234')).toBe(true);
    expect(PlacaValidator.isValid('ABC 1234')).toBe(true);
  });

  test('deve validar placas no formato Mercosul', () => {
    expect(PlacaValidator.isValid('ABC1D23')).toBe(true);
    expect(PlacaValidator.isValid('abc1d23')).toBe(true);
    expect(PlacaValidator.isValid('ABC-1D23')).toBe(true);
  });

  test('deve rejeitar placas inválidas', () => {
    expect(PlacaValidator.isValid('AB12345')).toBe(false);
    expect(PlacaValidator.isValid('ABCD123')).toBe(false);
    expect(PlacaValidator.isValid('1234ABC')).toBe(false);
    expect(PlacaValidator.isValid('ABC-12D3')).toBe(false);
  });
});
