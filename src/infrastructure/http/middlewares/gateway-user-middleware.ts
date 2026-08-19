import { Request, Response, NextFunction } from 'express';
import { TokenPayloadDto } from '../../../application/dtos/auth/auth.dtos';

export function gatewayUserMiddleware(req: Request, res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'];
    const email = req.headers['x-user-email'];

    if (!userId || !email || Array.isArray(userId) || Array.isArray(email)) {
        return res.status(401).json({ error: 'Token não informado' });
    }

    (req as Request & { user: TokenPayloadDto }).user = {
        userId: String(userId),
        email: String(email),
    };

    return next();
}
