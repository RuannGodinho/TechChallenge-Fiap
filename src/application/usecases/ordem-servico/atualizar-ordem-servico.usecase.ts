import { ISagaPreparacaoPort } from '../../ports/saga-preparacao.port';
import { AtualizarOrdemServicoInputDto } from "../../dtos/ordem-servico/ordem-servico.dtos";

import { OrdemServico } from "../../../enterprise/entities/ordem-servico.entity";

import { IOrdemServicoGateway } from "../../ports/ordem-servico.gateway.port";

import { IClienteLookupPort } from "../../ports/cliente-lookup.port";

import { IVeiculoLookupPort } from "../../ports/veiculo-lookup.port";

import { IExecucaoServicoPort } from "../../ports/execucao-servico.port";

import { AlterarStatusOrdemServicoUseCase } from "./alterar-status-ordem-servico.usecase";

import { AtualizarItensOrdemServicoUseCase } from "./atualizar-itens-ordem-servico.usecase";

export class AtualizarOrdemServicoUseCase {
    constructor(
        private readonly ordemServicoGateway: IOrdemServicoGateway,

        private readonly clienteLookupPort: IClienteLookupPort,

        private readonly veiculoLookupPort: IVeiculoLookupPort,

        private readonly execucaoServicoPort: IExecucaoServicoPort,

        private readonly alterarStatusOrdemServicoUseCase: AlterarStatusOrdemServicoUseCase,

        private readonly atualizarItensOrdemServicoUseCase: AtualizarItensOrdemServicoUseCase,
        private readonly saga?: ISagaPreparacaoPort,
    ) { }

    async execute(
        id: string,
        input: AtualizarOrdemServicoInputDto, key?:string,
    ): Promise<OrdemServico> {
        const ordem = await this.ordemServicoGateway.findById(id);

        if (!ordem) {
            throw new Error(`Ordem de serviço não encontrada para o id ${id}.`);
        }

        const expectedStatus = ordem.status.value;
        const originalHistoryLength = ordem.statusHistory.length;
        const owned = !!this.saga && await this.saga.gerenciada(id);
        if (owned && key) {
            const replay = await this.saga!.repetirDiagnostico(id, key, input);
            if (replay) return replay;
        }
        if(owned && ['EM EXECUCAO','FINALIZADA','ENTREGUE'].includes(ordem.status.value) && (input.pecas || input.servicos)) throw new Error('Conflito: itens da preparação concluída são imutáveis');
        const gerenciada = owned && !['EM EXECUCAO','FINALIZADA','ENTREGUE'].includes(ordem.status.value);
        if (gerenciada) { await this.saga!.validarEdicao(id,key); if (input.status && !['EM DIAGNOSTICO'].includes(input.status)) throw new Error('Conflito: status controlado pela Saga'); }
        const servicosOriginais = ordem.servicos.map((servicoId) =>
            servicoId.toString(),
        );

        if (input.cpfCnpj) {
            const clienteExists = await this.clienteLookupPort.existsByCpf(
                input.cpfCnpj,
            );

            if (!clienteExists) {
                throw new Error("Cliente não encontrado para o CPF/CNPJ fornecido.");
            }

            ordem.atualizarCpfCnpj(input.cpfCnpj);
        }

        if (input.veiculoId) {
            const veiculoExists = await this.veiculoLookupPort.existsById(
                input.veiculoId,
            );

            if (!veiculoExists) {
                throw new Error("Veículo não encontrado para o ID fornecido.");
            }

            ordem.atualizarVeiculo(input.veiculoId);
        }

        if (
            input.servicos?.length &&
            !OrdemServico.temItensParaAtualizar(input.pecas, input.servicos)
        ) {
            ordem.servicos = OrdemServico.dedupeServicos(input.servicos);
        }

        if (input.status) {
            await this.alterarStatusOrdemServicoUseCase.execute(ordem, input.status);
        }

        if (OrdemServico.temItensParaAtualizar(input.pecas, input.servicos)) {
            const snapshot = await this.atualizarItensOrdemServicoUseCase.execute(ordem, input, gerenciada);
            if (gerenciada && snapshot) return this.saga!.salvarDiagnostico(ordem, snapshot,key,input);
        }

        if (!gerenciada) await this.sincronizarExecucoes(id, servicosOriginais, ordem.servicos);

        // A managed diagnosis can commit without changing status. Do not overwrite its
        // items or total with the entity read before the customer/vehicle lookups.
        const changes: Partial<OrdemServico> = owned ? {} : ordem;
        if (owned) {
            if (input.cpfCnpj) changes.cpfCnpj = ordem.cpfCnpj;
            if (input.veiculoId) changes.veiculoId = ordem.veiculoId;
            if (ordem.statusHistory.length !== originalHistoryLength) {
                changes.status = ordem.status;
                changes.statusEnteredAt = ordem.statusEnteredAt;
                changes.statusHistory = ordem.statusHistory;
            }
        }
        const updated = await this.ordemServicoGateway.update(id, changes, expectedStatus);

        if (!updated) {
            throw new Error(`Ordem de serviço não encontrada para o id ${id}.`);
        }

        return updated;
    }

    private async sincronizarExecucoes(
        ordemId: string,

        servicosOriginais: string[],

        servicosFinais: string[],
    ): Promise<void> {
        const servicosNovos = OrdemServico.dedupeServicos(servicosFinais).filter(
            (servicoId) => !servicosOriginais.includes(servicoId),
        );

        if (servicosNovos.length) {
            await this.execucaoServicoPort.createExecucoesParaServicos(
                ordemId,
                servicosNovos,
            );
        }
    }
}
