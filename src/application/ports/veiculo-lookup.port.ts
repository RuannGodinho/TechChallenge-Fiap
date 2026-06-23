export interface IVeiculoLookupPort {
    existsById(veiculoId: string): Promise<boolean>;
}
