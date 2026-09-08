import { CriarOrdemServicoInputDto } from '../../dtos/ordem-servico/ordem-servico.dtos';
import { OrdemServico } from '../../../enterprise/entities/ordem-servico.entity';
import { IOrdemServicoGateway } from '../../ports/ordem-servico.gateway.port';
import { IClienteLookupPort } from '../../ports/cliente-lookup.port';
import { IVeiculoLookupPort } from '../../ports/veiculo-lookup.port';
import { IExecucaoServicoPort } from '../../ports/execucao-servico.port';
import { IObservabilityPort } from '../../ports/observability.port';
import { BusinessEvent, BusinessReason } from '../../observability/business-events';

export class CriarOrdemServicoUseCase {
    constructor(
        private readonly ordemServicoGateway: IOrdemServicoGateway,
        private readonly clienteLookupPort: IClienteLookupPort,
        private readonly veiculoLookupPort: IVeiculoLookupPort,
        private readonly execucaoServicoPort: IExecucaoServicoPort,
        private readonly observability: IObservabilityPort
    ) {}

    async execute(input: CriarOrdemServicoInputDto): Promise<OrdemServico> {
        const ordem = OrdemServico.create({
            cpfCnpj: input.cpfCnpj,
            veiculoId: input.veiculoId,
            pecas: input.pecas,
            servicos: input.servicos,
        });

        const clienteExists = await this.clienteLookupPort.existsByCpf(ordem.cpfCnpj.value);

        if (!clienteExists) {
            this.observability.emit({
                msg: BusinessEvent.osCreateRejected,
                reason: BusinessReason.clienteNaoEncontrado,
            });
            throw new Error('Cliente não encontrado para o CPF/CNPJ fornecido.');
        }

        const veiculoExists = await this.veiculoLookupPort.existsById(ordem.veiculoId.value);

        if (!veiculoExists) {
            this.observability.emit({
                msg: BusinessEvent.osCreateRejected,
                reason: BusinessReason.veiculoNaoEncontrado,
            });
            throw new Error('Veículo não encontrado para o ID fornecido.');
        }

        const saved = await this.ordemServicoGateway.save(ordem);

        this.observability.emit({
            msg: BusinessEvent.osCreated,
            ordemServicoId: saved.id,
            status: saved.status.value,
        });

        if (saved.id && saved.servicos.length > 0) {
            await this.execucaoServicoPort.createExecucoesParaServicos(saved.id, saved.servicos);
        }

        return saved;
    }
}
