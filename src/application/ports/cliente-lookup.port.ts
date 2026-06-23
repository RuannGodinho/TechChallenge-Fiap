export interface IClienteLookupPort {
    existsByCpf(cpfCnpj: string): Promise<boolean>;
}
