import { ObjectId } from 'mongodb';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { ConcluirExecucaoOrdemUseCase } from '../../src/application/usecases/ordem-servico/concluir-execucao-ordem.usecase';
import { OrderCompletionConflict } from '../../src/application/ports/order-completion.port';
function order(status='EM EXECUCAO') { return OrdemServico.restore({id:'order',cpfCnpj:'11144477735',veiculoId:new ObjectId().toString(),status,dataAbertura:new Date(),pecas:[],servicos:[]}); }
test('persists a domain transition before notifying Billing',async()=>{
 const sequence:string[]=[];const current=order();
 const repository={findById:async()=>current,saveTransition:jest.fn(async(_id,_expected,next:OrdemServico)=>{sequence.push('save');return next;})};
 const useCase=new ConcluirExecucaoOrdemUseCase(repository,{notify:async()=>{sequence.push('notify');}},{emit(){}});
 const result=await useCase.execute('order');expect(result?.status.value).toBe('FINALIZADA');expect(sequence).toEqual(['save','notify']);expect(repository.saveTransition).toHaveBeenCalledWith('order','EM EXECUCAO',current);
});
test('reloads after a competing finalization instead of writing a duplicate transition',async()=>{
 const repository={findById:jest.fn().mockResolvedValueOnce(order()).mockResolvedValue(order('FINALIZADA')),saveTransition:jest.fn().mockResolvedValue(null)};
 const notify=jest.fn();const useCase=new ConcluirExecucaoOrdemUseCase(repository,{notify},{emit(){}});
 await expect(useCase.execute('order')).resolves.toMatchObject({status:expect.objectContaining({value:'FINALIZADA'})});expect(repository.saveTransition).toHaveBeenCalledTimes(1);expect(notify).toHaveBeenCalledTimes(1);
});
test('domain rejects completion from an ineligible state',async()=>{
 const saveTransition=jest.fn();const notify=jest.fn();const useCase=new ConcluirExecucaoOrdemUseCase({findById:async()=>order('RECEBIDA'),saveTransition},{notify},{emit(){}});
 await expect(useCase.execute('order')).rejects.toBeInstanceOf(OrderCompletionConflict);expect(saveTransition).not.toHaveBeenCalled();expect(notify).not.toHaveBeenCalled();
});
