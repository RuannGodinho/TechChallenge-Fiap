export interface SagaResponse {sagaId:string;orderId:string;attempt:number;stage:string;version:number;estimateId?:string;deadline:Date;error?:string;}
export interface IConsultaSagaPort {
 consultar(id:string):Promise<SagaResponse|null>;
 cancelar(id:string,reason?:string):Promise<void>;
 retomar(id:string):Promise<void>;
 podeIniciar(id:string):Promise<boolean>;
}
