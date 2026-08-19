import { Request, Response, NextFunction } from 'express';
import { isGatewayAuthMode } from '../../../config/auth-mode';
import { gatewayUserMiddleware } from './gateway-user-middleware';
import { localAuthMiddleware } from './local-auth-middleware';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (isGatewayAuthMode) {
        return gatewayUserMiddleware(req, res, next);
    }

    return localAuthMiddleware(req, res, next);
}
