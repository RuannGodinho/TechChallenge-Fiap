import { connectDatabase } from '../database';
import { SagaPreparacaoMongoGateway } from '../../Adapters/gateways/saga-preparacao.mongo.gateway';
import { SagaOrdemServicoController } from '../../Adapters/controllers/saga-ordem-servico.controller';
import { ConsultarSagaOrdemServicoUseCase,CompensarPreparacaoOrdemServicoUseCase,RetomarSagaUseCase } from '../../application/usecases/saga/consultar-saga-ordem-servico.usecase';
export async function createSagaController(){const gateway=new SagaPreparacaoMongoGateway(await connectDatabase());return new SagaOrdemServicoController(new ConsultarSagaOrdemServicoUseCase(gateway),new CompensarPreparacaoOrdemServicoUseCase(gateway),new RetomarSagaUseCase(gateway));}
