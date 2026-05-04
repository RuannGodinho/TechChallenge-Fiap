import { cpf, cnpj } from 'cpf-cnpj-validator';

export type TipoCpfCnpj = 'CPF' | 'CNPJ';

export function normalizeCpfCnpj(value: string) {
  const strippedCpf = cpf.strip(value);
  if (cpf.isValid(strippedCpf)) {
    return { type: 'CPF' as const, stripped: strippedCpf, formatted: cpf.format(strippedCpf) };
  }

  const strippedCnpj = cnpj.strip(value);
  if (cnpj.isValid(strippedCnpj)) {
    return { type: 'CNPJ' as const, stripped: strippedCnpj, formatted: cnpj.format(strippedCnpj) };
  }

  throw new Error('CPF/CNPJ inválido');
}

export function formatCpfCnpj(value: string) {
  const strippedCpf = cpf.strip(value);
  if (cpf.isValid(strippedCpf)) {
    return cpf.format(strippedCpf);
  }

  const strippedCnpj = cnpj.strip(value);
  if (cnpj.isValid(strippedCnpj)) {
    return cnpj.format(strippedCnpj);
  }

  return value;
}
