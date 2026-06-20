export interface CreateVeiculoInputDto {
    placa: string;
    modelo: string;
    ano: number;
    marca: string;
}

export interface UpdateVeiculoInputDto {
    placa?: string;
    modelo?: string;
    ano?: number;
    marca?: string;
}

export interface VeiculoResponseDto {
    id?: string;
    placa: string;
    modelo: string;
    ano: number;
    marca: string;
}
