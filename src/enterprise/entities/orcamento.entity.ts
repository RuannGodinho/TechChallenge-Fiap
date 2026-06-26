import { Peca } from './peca.entity';
import { Servico } from './servico.entity';
import { StatusOrcamento } from '../value-objects/status-orcamento.vo';

export class Orcamento {
    id?: string;
    ordemServicoId: string;
    versao: number;
    status: StatusOrcamento;
    pecas: Peca[];
    itensServicos: Servico[];
    valorTotal: number;
    validadeEm: Date;
    criadoEm: Date;

    constructor(
        ordemServicoId: string,
        versao: number,
        status: StatusOrcamento,
        pecas: Peca[],
        itensServicos: Servico[],
        valorTotal: number,
        validadeEm: Date,
        criadoEm: Date,
        id?: string
    ) {
        this.ordemServicoId = ordemServicoId;
        this.versao = versao;
        this.status = status;
        this.pecas = pecas;
        this.itensServicos = itensServicos;
        this.valorTotal = valorTotal;
        this.validadeEm = validadeEm;
        this.criadoEm = criadoEm;
        this.id = id;
    }

    static createPendente(props: {
        ordemServicoId: string;
        pecas: Peca[];
        servicos: Servico[];
        valorTotal: number;
        validadeEm?: Date;
        criadoEm?: Date;
    }): Orcamento {
        return new Orcamento(
            props.ordemServicoId,
            1,
            StatusOrcamento.pendente(),
            props.pecas,
            props.servicos,
            props.valorTotal,
            props.validadeEm ?? new Date(),
            props.criadoEm ?? new Date()
        );
    }

    static restore(props: {
        id?: string;
        ordemServicoId: string;
        versao: number;
        status: string;
        pecas: Peca[];
        itensServicos: Servico[];
        valorTotal: number;
        validadeEm: Date;
        criadoEm: Date;
    }): Orcamento {
        return new Orcamento(
            props.ordemServicoId,
            props.versao,
            StatusOrcamento.from(props.status),
            props.pecas,
            props.itensServicos,
            props.valorTotal,
            props.validadeEm,
            props.criadoEm,
            props.id
        );
    }

    aplicarAtualizacao(updates: {
        ordemServicoId?: string;
        versao?: number;
        status?: string;
        valorTotal?: number;
        validadeEm?: Date;
    }): void {
        if (updates.status) {
            this.status = StatusOrcamento.from(updates.status);
        }

        if (updates.versao != null) {
            this.versao = updates.versao;
        }

        if (updates.valorTotal != null) {
            this.valorTotal = updates.valorTotal;
        }

        if (updates.validadeEm) {
            this.validadeEm = updates.validadeEm;
        }

        if (updates.ordemServicoId) {
            this.ordemServicoId = updates.ordemServicoId;
        }
    }
}
