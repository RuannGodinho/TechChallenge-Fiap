export interface CreateClienteInputDto {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    status?: string;
}

export interface UpdateClienteInputDto {
    nome?: string;
    email?: string;
    cpf?: string;
    telefone?: string;
    status?: string;
}

export interface ClienteResponseDto {
    id?: string;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    status: string;
}
