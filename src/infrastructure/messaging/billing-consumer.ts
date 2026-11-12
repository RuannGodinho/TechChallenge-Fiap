import amqp from 'amqplib';
import { connectDatabase, closeDatabase } from '../database';
import { logger } from '../logging/logger';
import { parseBillingEvent, recordBillingEvent } from './billing-events';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let stopping = false;
process.on('SIGTERM', () => { stopping = true; });
process.on('SIGINT', () => { stopping = true; });

async function main() {
 const url = process.env.RABBITMQ_URL;
 if (!url) throw new Error('RABBITMQ_URL is required');
 const db = await connectDatabase();
 while (!stopping) {
  let connection: amqp.ChannelModel | undefined;
  try {
   connection = await amqp.connect(url);
   let closed = false;
   connection.on('error', err => logger.error({ err, msg: 'billing_consumer_connection_error' }));
   connection.on('close', () => { closed = true; });
   const channel = await connection.createChannel();
   channel.on('error', err => logger.error({ err, msg: 'billing_consumer_channel_error' }));
   channel.on('close', () => { closed = true; });
   await channel.assertExchange('billing.events', 'topic', { durable: true });
   await channel.assertExchange('billing.events.dlx', 'direct', { durable: true });
   await channel.assertQueue('service-orders.billing.dlq', { durable: true });
   await channel.bindQueue('service-orders.billing.dlq', 'billing.events.dlx', 'service-orders.billing');
   await channel.assertQueue('service-orders.billing', { durable: true, arguments: { 'x-dead-letter-exchange': 'billing.events.dlx', 'x-dead-letter-routing-key': 'service-orders.billing' } });
   await channel.bindQueue('service-orders.billing', 'billing.events', 'estimate.#');
   await channel.bindQueue('service-orders.billing', 'billing.events', 'payment.#');
   await channel.prefetch(1);
   const consumer = await channel.consume('service-orders.billing', async msg => {
    if (!msg) return;
    let event;
    try { event = parseBillingEvent(msg.content); if (msg.properties.messageId !== event.messageId) throw new Error('Message ID mismatch'); }
    catch (err) { logger.error({ err, msg: 'billing_event_invalid' }); channel.nack(msg, false, false); return; }
    for (let attempt = 1; attempt <= 3; attempt++) {
     try {
      const outcome = await recordBillingEvent(db.collection('OrdemServico'), event);
      logger.info({ msg: 'billing_event_processed', messageId: event.messageId, orderId: event.orderId, outcome });
      channel.ack(msg); return;
     } catch (err) {
      logger.error({ err, msg: 'billing_event_processing_failed', messageId: event.messageId, attempt });
      if (attempt < 3) await delay(1000 * attempt);
     }
    }
    channel.nack(msg, false, false);
   });
   while (!stopping && !closed) await delay(1000);
   if (!closed) { await channel.cancel(consumer.consumerTag); await channel.close(); }
  } catch (err) { logger.error({ err, msg: 'billing_consumer_unavailable' }); }
  finally { if (connection) await connection.close().catch(() => undefined); }
  if (!stopping) await delay(5000);
 }
 await closeDatabase();
}
main().catch(err => { logger.fatal({ err, msg: 'billing_consumer_stopped' }); process.exitCode = 1; });
