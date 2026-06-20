export interface CreateClienteInputDto {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
}

export interface UpdateClienteInputDto {
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
}

export interface ClienteResponseDto {
    id?: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
}
