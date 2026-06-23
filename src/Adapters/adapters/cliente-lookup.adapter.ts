import { IClienteLookupPort } from '../../application/ports/cliente-lookup.port';
import { BuscarClientePorCpfUseCase } from '../../application/usecases/cliente/buscar-cliente-por-cpf.usecase';

export class ClienteLookupAdapter implements IClienteLookupPort {
    constructor(private readonly buscarClientePorCpfUseCase: BuscarClientePorCpfUseCase) {}

    async existsByCpf(cpfCnpj: string): Promise<boolean> {
        const cliente = await this.buscarClientePorCpfUseCase.execute(cpfCnpj);
        return cliente != null;
    }
}
