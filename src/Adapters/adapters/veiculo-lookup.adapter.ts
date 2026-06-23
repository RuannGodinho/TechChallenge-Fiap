import { IVeiculoLookupPort } from '../../application/ports/veiculo-lookup.port';
import { BuscarVeiculoPorIdUseCase } from '../../application/usecases/veiculo/buscar-veiculo-por-id.usecase';

export class VeiculoLookupAdapter implements IVeiculoLookupPort {
    constructor(private readonly buscarVeiculoPorIdUseCase: BuscarVeiculoPorIdUseCase) {}

    async existsById(veiculoId: string): Promise<boolean> {
        const veiculo = await this.buscarVeiculoPorIdUseCase.execute(veiculoId);
        return veiculo != null;
    }
}
