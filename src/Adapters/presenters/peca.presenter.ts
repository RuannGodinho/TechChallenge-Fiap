import { PecaResponseDto } from '../../application/dtos/peca/peca.dtos';
import { Peca } from '../../enterprise/entities/peca.entity';

export class PecaPresenter {
    present(peca: Peca): PecaResponseDto {
        return {
            id: peca.id,
            nome: peca.nome,
            descricao: peca.descricao,
            tipo: peca.tipo,
            preco: peca.preco,
            quantidade: peca.quantidade,
        };
    }

    presentList(pecas: Peca[]): PecaResponseDto[] {
        return pecas.map((peca) => this.present(peca));
    }
}
