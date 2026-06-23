import { TokenPayloadDto } from '../dtos/auth/auth.dtos';

export interface ITokenPort {
    sign(payload: TokenPayloadDto): string;
    verify(token: string): TokenPayloadDto;
}
