import { PecaId } from '../value-objects/peca-id.vo';
import { Quantidade } from '../value-objects/quantidade.vo';
import { TipoMovimentacao } from '../value-objects/tipo-movimentacao.vo';
import { OrigemMovimentacao } from '../value-objects/origem-movimentacao.vo';

export class MovimentacaoEstoque {
    id?: string;
    pecaId: PecaId;
    tipo: TipoMovimentacao;
    quantidade: Quantidade;
    data: Date;
    origem: OrigemMovimentacao;

    constructor(
        pecaId: PecaId,
        tipo: TipoMovimentacao,
        quantidade: Quantidade,
        data: Date,
        origem: OrigemMovimentacao,
        id?: string
    ) {
        this.pecaId = pecaId;
        this.tipo = tipo;
        this.quantidade = quantidade;
        this.data = data;
        this.origem = origem;
        this.id = id;
    }

    static create(
        pecaId: string,
        tipo: string,
        quantidade: number,
        data: Date,
        origem: string
    ): MovimentacaoEstoque {
        return new MovimentacaoEstoque(
            PecaId.from(pecaId),
            TipoMovimentacao.from(tipo),
            Quantidade.from(quantidade),
            data,
            OrigemMovimentacao.from(origem)
        );
    }
}
