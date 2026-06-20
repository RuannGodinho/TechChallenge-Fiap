export class Email {
    private readonly _email: string;

    private constructor(email: string) {
        this._email = email;
    }

    static from(email: string): Email {
        if (!email) {
            throw new Error('Email nao pode ser vazio');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email invalido');
        }

        return new Email(email);
    }

    get value(): string {
        return this._email;
    }

    toString(): string {
        return this._email;
    }
}
