import { OrdemServicoDetalhesInput } from "../../dtos/ordem-servico/ordem-servico.dtos";

import { Documento } from "../../../enterprise/value-objects/documento.vo";

import { IOrdemServicoGateway } from "../../ports/ordem-servico.gateway.port";

import { ObterDetalhesOrdemServicoUseCase } from "./obter-detalhes-ordem-servico.usecase";

export class BuscarOrdensPorCpfCnpjUseCase {
    constructor(
        private readonly ordemServicoGateway: IOrdemServicoGateway,

        private readonly obterDetalhesOrdemServicoUseCase: ObterDetalhesOrdemServicoUseCase,
    ) { }

    async execute(cpfCnpj: string): Promise<OrdemServicoDetalhesInput[]> {
        const documento = Documento.from(cpfCnpj);

        const ordens = await this.ordemServicoGateway.findByCpfCnpj(
            documento.value,
        );

        if (!ordens.length) {
            throw new Error(
                `Ordem de serviço não encontrada para o CPF/CNPJ ${documento.value}.`,
            );
        }

        return Promise.all(
            ordens.map((ordem) =>
                this.obterDetalhesOrdemServicoUseCase.execute(ordem),
            ),
        );
    }
}
