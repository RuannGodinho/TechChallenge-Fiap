import {
    EstoqueResponseDto,
    MovimentacaoEstoqueResponseDto,
} from '../../application/dtos/estoque/estoque.dtos';
import { Estoque } from '../../enterprise/entities/estoque.entity';
import { MovimentacaoEstoque } from '../../enterprise/entities/movimentacao-estoque.entity';

export class EstoquePresenter {
    presentEstoque(estoque: Estoque): EstoqueResponseDto {
        return {
            pecaId: estoque.pecaId.value,
            quantidade: estoque.quantidade.value,
        };
    }

    presentEstoqueList(estoque: Estoque[]): EstoqueResponseDto[] {
        return estoque.map((item) => this.presentEstoque(item));
    }

    presentMovimentacao(movimentacao: MovimentacaoEstoque): MovimentacaoEstoqueResponseDto {
        return {
            id: movimentacao.id,
            pecaId: movimentacao.pecaId.value,
            tipo: movimentacao.tipo.value,
            quantidade: movimentacao.quantidade.value,
            data: movimentacao.data,
            origem: movimentacao.origem.value,
        };
    }

    presentMovimentacaoList(
        movimentacoes: MovimentacaoEstoque[]
    ): MovimentacaoEstoqueResponseDto[] {
        return movimentacoes.map((movimentacao) => this.presentMovimentacao(movimentacao));
    }
}
