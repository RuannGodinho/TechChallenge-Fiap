export interface ExecutionInbox {
    contains(messageId:string):Promise<boolean>;
    record(event:{messageId:string;orderId:string;occurredAt:string}):Promise<void>;
}
