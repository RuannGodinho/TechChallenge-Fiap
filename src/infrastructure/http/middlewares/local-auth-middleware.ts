import { Request, Response, NextFunction } from 'express';
import { DIContainer } from '../../composition-root/di-container';

export function localAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não informado' });
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = DIContainer.getInstance().getVerificarTokenUseCase().execute(token);
        (req as Request & { user: typeof decoded }).user = decoded;
        return next();
    } catch {
        return res.status(401).json({ error: 'Token inválido' });
    }
}
