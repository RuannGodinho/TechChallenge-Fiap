import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { runWithRequestContext } from '../../logging/request-context';

const SKIP_EXACT = new Set(['/health', '/ready', '/swagger.json']);

export function requestLogging(req: Request, res: Response, next: NextFunction) {
    if (SKIP_EXACT.has(req.path) || req.path.startsWith('/docs')) {
        return next();
    }

    const requestId =
        (typeof req.headers['x-request-id'] === 'string' && req.headers['x-request-id']) ||
        randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    const started = Date.now();

    res.on('finish', () => {
        const status = res.statusCode;
        const payload = {
            msg: 'http_request',
            requestId,
            method: req.method,
            path: req.originalUrl.split('?')[0],
            status,
            durationMs: Date.now() - started,
        };

        if (status >= 500) {
            logger.error(payload);
            return;
        }
        if (status >= 400) {
            logger.warn(payload);
            return;
        }
        logger.info(payload);
    });

    runWithRequestContext({ requestId }, () => next());
}
