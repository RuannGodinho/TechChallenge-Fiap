import { ConcluirExecucaoOrdemUseCase } from '../../application/usecases/ordem-servico/concluir-execucao-ordem.usecase';
import { OrderCompletionRepository } from '../../application/ports/order-completion.port';
import { OrdemServicoPresenter } from '../presenters/ordem-servico.presenter';
export class ExecutionOrderController {
    constructor(private readonly orders: Pick<OrderCompletionRepository, 'findById'>, private readonly complete: Pick<ConcluirExecucaoOrdemUseCase, 'execute'>, private readonly presenter = new OrdemServicoPresenter()) {}
    async buscarOrdemServicoPorId(id: string) { const order = await this.orders.findById(id); return order ? this.presenter.present(order) : null; }
    async finalizar(id: string) { const order = await this.complete.execute(id); return order ? this.presenter.present(order) : null; }
}
