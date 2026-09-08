import { Documento } from "../value-objects/documento.vo";

import { VeiculoId } from "../value-objects/veiculo-id.vo";

import { StatusOS } from "../value-objects/status-os.vo";

import { OrdemPecaItem } from "../value-objects/ordem-peca-item.vo";

export interface StatusTransitionResult {
    from: string;
    to: string;
    durationMs: number;
}

export interface CriarOrdemServicoInput {
    cpfCnpj: string;

    veiculoId: string;

    pecas?: Array<{ pecaId: string; quantidade: number; valorUnitario?: number }>;

    servicos?: string[];
}

export class OrdemServico {
    id?: string;

    cpfCnpj: Documento;

    veiculoId: VeiculoId;

    status: StatusOS;

    dataAbertura: Date;

    statusEnteredAt: Date;

    pecas: OrdemPecaItem[];

    servicos: string[];

    valorTotal?: number;

    constructor(
        cpfCnpj: Documento,

        veiculoId: VeiculoId,

        status: StatusOS,

        dataAbertura: Date,

        pecas: OrdemPecaItem[],

        servicos: string[],

        id?: string,

        valorTotal?: number,

        statusEnteredAt?: Date,
    ) {
        this.cpfCnpj = cpfCnpj;

        this.veiculoId = veiculoId;

        this.status = status;

        this.dataAbertura = dataAbertura;

        this.pecas = pecas;

        this.servicos = servicos;

        this.id = id;

        this.valorTotal = valorTotal;

        this.statusEnteredAt = statusEnteredAt ?? dataAbertura;
    }

    static dedupeServicos(servicos: string[]): string[] {
        return [...new Set(servicos.map((servicoId) => servicoId.toString()))];
    }

    static create(input: CriarOrdemServicoInput): OrdemServico {
        const cpfCnpj = Documento.from(input.cpfCnpj);

        const veiculoId = VeiculoId.from(input.veiculoId);

        const pecas = (input.pecas ?? []).map((item) =>
            OrdemPecaItem.create(
                item.pecaId,
                item.quantidade,
                item.valorUnitario ?? 0,
            ),
        );

        const servicos = OrdemServico.dedupeServicos(input.servicos ?? []);

        return new OrdemServico(
            cpfCnpj,

            veiculoId,

            StatusOS.recebida(),

            new Date(),

            pecas,

            servicos,
        );
    }

    static restore(props: {
        id?: string;

        cpfCnpj: string;

        veiculoId: string;

        status: string;

        dataAbertura: Date;

        pecas: Array<{ pecaId: string; quantidade: number; valorUnitario: number }>;

        servicos: string[];

        valorTotal?: number;

        statusEnteredAt?: Date;
    }): OrdemServico {
        return new OrdemServico(
            Documento.from(props.cpfCnpj),

            VeiculoId.from(props.veiculoId),

            StatusOS.from(props.status),

            props.dataAbertura,

            props.pecas.map((item) =>
                OrdemPecaItem.restore(item.pecaId, item.quantidade, item.valorUnitario),
            ),

            OrdemServico.dedupeServicos(props.servicos),

            props.id,

            props.valorTotal,

            props.statusEnteredAt ?? props.dataAbertura,
        );
    }

    transicionarStatus(novoStatus: StatusOS): StatusTransitionResult {
        StatusOS.validateTransition(this.status, novoStatus);

        const from = this.status.value;
        const durationMs = Math.max(0, Date.now() - this.statusEnteredAt.getTime());

        this.status = novoStatus;
        this.statusEnteredAt = new Date();

        return { from, to: novoStatus.value, durationMs };
    }

    promoverParaAguardandoAprovacao(): StatusTransitionResult {
        return this.transicionarStatus(StatusOS.from("AGUARDANDO APROVACAO"));
    }

    static temItensParaAtualizar(
        pecas?: unknown[] | null,

        servicos?: unknown[] | null,
    ): boolean {
        return !!(pecas?.length && servicos?.length);
    }

    aplicarItens(
        pecas: OrdemPecaItem[],
        servicos: string[],
        valorTotal: number,
    ): void {
        this.pecas = pecas;

        this.servicos = OrdemServico.dedupeServicos(servicos);

        this.valorTotal = valorTotal;
    }

    atualizarCpfCnpj(cpfCnpj: string): void {
        this.cpfCnpj = Documento.from(cpfCnpj);
    }

    atualizarVeiculo(veiculoId: string): void {
        this.veiculoId = VeiculoId.from(veiculoId);
    }
}
