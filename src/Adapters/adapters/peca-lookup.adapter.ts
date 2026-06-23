import { IPecaLookupPort, PecaLookupData } from '../../application/ports/peca-lookup.port';
import { BuscarPecaPorIdUseCase } from '../../application/usecases/peca/buscar-peca-por-id.usecase';

export class PecaLookupAdapter implements IPecaLookupPort {
    constructor(private readonly buscarPecaPorIdUseCase: BuscarPecaPorIdUseCase) {}

    async findById(id: string): Promise<PecaLookupData | null> {
        const peca = await this.buscarPecaPorIdUseCase.execute(id);

        if (!peca || !peca.id) {
            return null;
        }

        return {
            id: peca.id,
            nome: peca.nome,
            descricao: peca.descricao,
            preco: peca.preco,
            tipo: peca.tipo,
        };
    }
}
