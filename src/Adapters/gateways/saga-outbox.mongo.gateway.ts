import { randomUUID } from 'node:crypto';
import { Db } from 'mongodb';
import { EventOutbox } from '../../application/ports/integration-event';
export class SagaMongoOutbox implements EventOutbox {
    private readonly owner = randomUUID();
    constructor(private readonly db: Db) { }
    async claim() { const row = await this.db.collection('SagaOutbox').findOneAndUpdate({ publishedAt: null, nextAttemptAt: { $lte: new Date() }, $or: [{ leaseUntil: null }, { leaseUntil: { $lt: new Date() } }] }, { $set: { owner: this.owner, leaseUntil: new Date(Date.now() + 30000) }, $inc: { attempts: 1 } }, { sort: { nextAttemptAt: 1 }, returnDocument: 'after' }); return row ? { id: row._id.toString(), event: row.event } : null; }
    async markPublished(id: string) { await this.db.collection<any>('SagaOutbox').updateOne({ _id: id, owner: this.owner }, { $set: { publishedAt: new Date(), leaseUntil: null } }); }
    async markFailed(id: string, error: string) {
        const row=await this.db.collection<any>('SagaOutbox').findOne({_id:id,owner:this.owner});
        const backoff=Math.min(60,2**Math.min(6,row?.attempts??1))*1000; await this.db.collection<any>('SagaOutbox').updateOne({ _id: id, owner: this.owner }, { $set: { leaseUntil: null, nextAttemptAt: new Date(Date.now() + backoff), lastError: error.slice(0, 1000) } }); }
}
