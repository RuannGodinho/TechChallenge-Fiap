export interface LoginInputDto {
    cpf: string;
}

export interface LoginResultDto {
    success: boolean;
    token?: string;
    error?: string;
    statusCode?: number;
}

export interface TokenPayloadDto {
    userId: string;
    cpf: string;
    email: string;
}

export interface LoginResponseDto {
    token: string;
}

export interface AuthenticatedUserResponseDto {
    userId: string;
    cpf: string;
    email: string;
}
