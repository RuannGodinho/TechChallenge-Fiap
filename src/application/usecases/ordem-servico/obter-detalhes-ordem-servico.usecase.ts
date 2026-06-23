import { OrdemServicoDetalhesInput } from "../../dtos/ordem-servico/ordem-servico.dtos";

import { OrdemServico } from "../../../enterprise/entities/ordem-servico.entity";

import { BuscarVeiculoPorIdUseCase } from "../veiculo/buscar-veiculo-por-id.usecase";

import { IPecaLookupPort } from "../../ports/peca-lookup.port";

import { IServicoLookupPort } from "../../ports/servico-lookup.port";

export class ObterDetalhesOrdemServicoUseCase {
    constructor(
        private readonly buscarVeiculoPorIdUseCase: BuscarVeiculoPorIdUseCase,

        private readonly pecaLookupPort: IPecaLookupPort,

        private readonly servicoLookupPort: IServicoLookupPort,
    ) { }

    async execute(ordem: OrdemServico): Promise<OrdemServicoDetalhesInput> {
        const veiculo = await this.buscarVeiculoPorIdUseCase.execute(
            ordem.veiculoId.value,
        );

        const pecas: OrdemServicoDetalhesInput["pecas"] = [];

        for (const item of ordem.pecas) {
            const peca = await this.pecaLookupPort.findById(item.pecaId.value);

            if (peca) {
                pecas.push({ item, peca });
            }
        }

        const servicos = [];

        for (const servicoId of ordem.servicos) {
            const servico = await this.servicoLookupPort.findById(servicoId);

            if (servico) {
                servicos.push(servico);
            }
        }

        return {
            ordem,

            veiculo,

            pecas,

            servicos,
        };
    }
}
