export class EmailConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EmailConfigurationError';
    }
}

export class EmailDeliveryError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EmailDeliveryError';
    }
}
