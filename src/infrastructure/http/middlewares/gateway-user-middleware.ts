import { Request, Response, NextFunction } from 'express';
import { TokenPayloadDto } from '../../../application/dtos/auth/auth.dtos';
import { isValidGatewayTrustHeader } from '../../../config/gateway-trust';

export function gatewayUserMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!isValidGatewayTrustHeader(req.headers['x-gateway-trust'])) {
        return res.status(401).json({ error: 'Token não informado' });
    }

    const userId = req.headers['x-user-id'];
    const email = req.headers['x-user-email'];
    const cpf = req.headers['x-user-cpf'];

    if (
        !userId ||
        !email ||
        !cpf ||
        Array.isArray(userId) ||
        Array.isArray(email) ||
        Array.isArray(cpf)
    ) {
        return res.status(401).json({ error: 'Token não informado' });
    }

    (req as Request & { user: TokenPayloadDto }).user = {
        userId: String(userId),
        cpf: String(cpf),
        email: String(email),
    };

    return next();
}
