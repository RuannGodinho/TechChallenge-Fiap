import { IServicoLookupPort, ServicoLookupData } from '../../application/ports/servico-lookup.port';
import { BuscarServicoPorIdUseCase } from '../../application/usecases/servico/buscar-servico-por-id.usecase';

export class ServicoLookupAdapter implements IServicoLookupPort {
    constructor(private readonly buscarServicoPorIdUseCase: BuscarServicoPorIdUseCase) {}

    async findById(id: string): Promise<ServicoLookupData | null> {
        const servico = await this.buscarServicoPorIdUseCase.execute(id);

        if (!servico || !servico.id) {
            return null;
        }

        return {
            id: servico.id,
            nome: servico.nome,
            descricao: servico.descricao,
            preco: servico.preco,
        };
    }
}
