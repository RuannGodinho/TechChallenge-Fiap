import { IConsultaSagaPort } from '../../ports/consulta-saga.port';
export class ConsultarSagaOrdemServicoUseCase {
 constructor(private readonly gateway:IConsultaSagaPort){}
 execute(id:string){return this.gateway.consultar(id);}
 podeIniciar(id:string){return this.gateway.podeIniciar(id);}
}
export class CompensarPreparacaoOrdemServicoUseCase {
 constructor(private readonly gateway:IConsultaSagaPort){}
 execute(id:string){return this.gateway.cancelar(id);}
}
export class RetomarSagaUseCase {
 constructor(private readonly gateway:IConsultaSagaPort){}
 execute(id:string){return this.gateway.retomar(id);}
}
