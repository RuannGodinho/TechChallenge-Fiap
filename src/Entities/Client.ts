export class Client {
    Name: string;
    Email: string;
    Cpf: string;
    Phone: string;

    constructor(name: string, email: string, cpf: string, phone: string) {
        this.Name = name;
        this.Email = email;
        this.Cpf = cpf;
        this.Phone = phone;
    }
}