import { ObjectId } from "mongodb";

import { OrdemServico } from "../../../enterprise/entities/ordem-servico.entity";

export interface OrdemPecaItemPersistenceModel {
    pecaId: { toString(): string } | string;

    quantidade: number;

    valorUnitario: number;
}

export interface OrdemServicoPersistenceModel {
    _id?: { toString(): string };

    cpfCnpj: string;

    veiculo: { toString(): string } | string;

    status: string;

    dataAbertura: Date;

    pecas?: OrdemPecaItemPersistenceModel[];

    servicos?: Array<{ toString(): string } | string>;

    valorTotal?: number;
}

export class OrdemServicoMapper {
    static toPersistence(
        ordem: OrdemServico,
    ): Omit<OrdemServicoPersistenceModel, "_id"> {
        const persistence: Omit<OrdemServicoPersistenceModel, "_id"> = {
            cpfCnpj: ordem.cpfCnpj.value,

            veiculo: new ObjectId(ordem.veiculoId.value),

            status: ordem.status.value,

            dataAbertura: ordem.dataAbertura,

            pecas: ordem.pecas.map((item) => ({
                pecaId: new ObjectId(item.pecaId.value),

                quantidade: item.quantidade,

                valorUnitario: item.valorUnitario,
            })),

            servicos: ordem.servicos.map((servicoId) => new ObjectId(servicoId)),
        };

        if (ordem.valorTotal != null) {
            persistence.valorTotal = ordem.valorTotal;
        }

        return persistence;
    }

    static toDomain(raw: OrdemServicoPersistenceModel): OrdemServico {
        const id = raw._id?.toString();

        const veiculoId =
            typeof raw.veiculo === "string" ? raw.veiculo : raw.veiculo.toString();

        return OrdemServico.restore({
            id,

            cpfCnpj: raw.cpfCnpj,

            veiculoId,

            status: raw.status,

            dataAbertura: raw.dataAbertura,

            pecas: (raw.pecas ?? []).map((item) => ({
                pecaId:
                    typeof item.pecaId === "string"
                        ? item.pecaId
                        : item.pecaId.toString(),

                quantidade: item.quantidade,

                valorUnitario: item.valorUnitario,
            })),

            servicos: (raw.servicos ?? []).map((servicoId) =>
                typeof servicoId === "string" ? servicoId : servicoId.toString(),
            ),

            valorTotal: raw.valorTotal,
        });
    }
}
