import jwt, { Secret } from 'jsonwebtoken';
import { TokenPayloadDto } from '../../application/dtos/auth/auth.dtos';
import { ITokenPort } from '../../application/ports/token.port';
import { jwtConfig } from '../../config/jwt';

export class JwtTokenAdapter implements ITokenPort {
    sign(payload: TokenPayloadDto): string {
        return jwt.sign(payload, jwtConfig.secret as Secret, {
            expiresIn: jwtConfig.expiresIn,
        });
    }

    verify(token: string): TokenPayloadDto {
        return jwt.verify(token, jwtConfig.secret as Secret) as TokenPayloadDto;
    }
}
