import { connectDatabase, closeDatabase } from '../database';
import { parseBillingEvent, recordBillingEvent } from './billing-events';
import { runConsumer, workerControl } from './rabbitmq';
async function main() {
    if(!process.env.RABBITMQ_URL) throw new Error('RABBITMQ_URL is required');
    const db=await connectDatabase();
    try {
        await runConsumer(process.env.RABBITMQ_URL,'service-orders.billing',(content,messageId)=>{
            const event=parseBillingEvent(content);
            if(event.messageId!==messageId) throw new Error('Message ID mismatch');
            return event;
        },event=>recordBillingEvent(db.collection('OrdemServico'),event),workerControl());
    } finally { await closeDatabase(); }
}
if(require.main===module) void main().catch(error=>{console.error(error.message);process.exitCode=1;});
