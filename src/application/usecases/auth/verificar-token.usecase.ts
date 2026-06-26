import { TokenPayloadDto } from '../../dtos/auth/auth.dtos';
import { ITokenPort } from '../../ports/token.port';

export class VerificarTokenUseCase {
    constructor(private readonly tokenPort: ITokenPort) {}

    execute(token: string): TokenPayloadDto {
        return this.tokenPort.verify(token);
    }
}
