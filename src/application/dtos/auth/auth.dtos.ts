export interface LoginInputDto {
    email: string;
    password: string;
}

export interface LoginResultDto {
    success: boolean;
    token?: string;
    error?: string;
}

export interface TokenPayloadDto {
    userId: string;
    email: string;
}

export interface LoginResponseDto {
    token: string;
}

export interface AuthenticatedUserResponseDto {
    userId: string;
    email: string;
}
