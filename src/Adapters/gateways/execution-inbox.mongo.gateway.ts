import { Db } from 'mongodb';
import { ExecutionInbox } from '../../application/ports/execution-inbox.port';
interface InboxRow { _id:string;orderId:string;occurredAt:Date;processedAt:Date; }
export class ExecutionInboxMongoGateway implements ExecutionInbox {
    private readonly collection;
    constructor(db:Db) { this.collection=db.collection<InboxRow>('ExecutionInbox'); }
    async contains(messageId:string) { return !!await this.collection.findOne({_id:messageId},{projection:{_id:1}}); }
    async record(event:{messageId:string;orderId:string;occurredAt:string}) {
        await this.collection.updateOne({_id:event.messageId},{$setOnInsert:{orderId:event.orderId,occurredAt:new Date(event.occurredAt),processedAt:new Date()}},{upsert:true});
    }
}
