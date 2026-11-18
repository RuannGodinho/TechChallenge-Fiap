import { IResultadoSagaPort } from '../../ports/saga-preparacao.port';
export class ProcessarResultadoSagaUseCase {
    constructor(private readonly gateway: IResultadoSagaPort) { }
    execute(message: unknown) { return this.gateway.processar(message); }
}
export class VerificarPrazosSagaUseCase {
    constructor(private readonly gateway: IResultadoSagaPort) { }
    execute() { return this.gateway.verificarPrazos(); }
}
