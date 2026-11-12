/** A remote dependency could not complete a request. */
export class DownstreamServiceError extends Error {
    constructor(public readonly service: string, message: string, public readonly orderId?: string) {
        super(message);
        this.name = 'DownstreamServiceError';
    }
}
