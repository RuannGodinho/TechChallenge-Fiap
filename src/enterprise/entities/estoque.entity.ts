import { PecaId } from '../value-objects/peca-id.vo';
import { Quantidade } from '../value-objects/quantidade.vo';
import { TipoMovimentacao } from '../value-objects/tipo-movimentacao.vo';
import { OrigemMovimentacao } from '../value-objects/origem-movimentacao.vo';
import { MovimentacaoEstoque } from './movimentacao-estoque.entity';

export interface RegistrarMovimentacaoInput {
    tipo: TipoMovimentacao;
    quantidade: Quantidade;
    data: Date;
    origem: OrigemMovimentacao;
}

export interface RegistrarMovimentacaoResult {
    estoque: Estoque;
    movimentacao: MovimentacaoEstoque;
}

export class Estoque {
    pecaId: PecaId;
    quantidade: Quantidade;
    private readonly persisted: boolean;

    constructor(pecaId: PecaId, quantidade: Quantidade, persisted = true) {
        this.pecaId = pecaId;
        this.quantidade = quantidade;
        this.persisted = persisted;
    }

    static restore(pecaId: PecaId, quantidade: Quantidade): Estoque {
        return new Estoque(pecaId, quantidade, true);
    }

    static inicial(pecaId: PecaId): Estoque {
        return new Estoque(pecaId, Quantidade.zero(), false);
    }

    isPersisted(): boolean {
        return this.persisted;
    }

    registrarMovimentacao(input: RegistrarMovimentacaoInput): RegistrarMovimentacaoResult {
        if (input.tipo.isSaida()) {
            if (this.quantidade.isZero()) {
                throw new Error('Não há estoque para a peça especificada');
            }

            const novaQuantidade = this.quantidade.subtract(input.quantidade);

            return {
                estoque: this.atualizarEstoque(novaQuantidade),
                movimentacao: this.criarMovimentacao(input),
            };
        }

        const novaQuantidade = this.persisted
            ? this.quantidade.add(input.quantidade)
            : input.quantidade;

        return {
            estoque: this.atualizarEstoque(novaQuantidade),
            movimentacao: this.criarMovimentacao(input),
        };
    }

    private atualizarEstoque(novaQuantidade: Quantidade): Estoque {
        if (this.persisted) {
            return Estoque.restore(this.pecaId, novaQuantidade);
        }

        return new Estoque(this.pecaId, novaQuantidade, false);
    }

    private criarMovimentacao(input: RegistrarMovimentacaoInput): MovimentacaoEstoque {
        return MovimentacaoEstoque.create(
            this.pecaId.value,
            input.tipo.value,
            input.quantidade.value,
            input.data,
            input.origem.value
        );
    }
}
