import { ConsumeExecutionCompletedUseCase } from '../../src/application/usecases/consume-execution-completed.usecase';
const event={messageId:'event',orderId:'order',occurredAt:new Date().toISOString()};
test('deduplicates a completed execution before invoking order finalization',async()=>{
 const finalize=jest.fn();const record=jest.fn();const useCase=new ConsumeExecutionCompletedUseCase({contains:async()=>true,record},{execute:finalize});
 await expect(useCase.execute(event)).resolves.toBe('duplicate');expect(finalize).not.toHaveBeenCalled();expect(record).not.toHaveBeenCalled();
});
test('processing failure leaves the inbox unacknowledged for retry',async()=>{
 const record=jest.fn();const useCase=new ConsumeExecutionCompletedUseCase({contains:async()=>false,record},{execute:async()=>{throw new Error('database unavailable');}});
 await expect(useCase.execute(event)).rejects.toThrow('database unavailable');expect(record).not.toHaveBeenCalled();
});
