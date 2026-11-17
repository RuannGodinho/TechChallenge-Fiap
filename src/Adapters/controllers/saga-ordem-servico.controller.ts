import { ConsultarSagaOrdemServicoUseCase,CompensarPreparacaoOrdemServicoUseCase,RetomarSagaUseCase } from '../../application/usecases/saga/consultar-saga-ordem-servico.usecase';
export class SagaOrdemServicoController {
 constructor(private readonly consulta:ConsultarSagaOrdemServicoUseCase,private readonly compensacao:CompensarPreparacaoOrdemServicoUseCase,private readonly recuperacao:RetomarSagaUseCase){}
 consultar(id:string){return this.consulta.execute(id);}
 podeIniciar(id:string){return this.consulta.podeIniciar(id);}
 cancelar(id:string){return this.compensacao.execute(id);}
 retomar(id:string){return this.recuperacao.execute(id);}
}
