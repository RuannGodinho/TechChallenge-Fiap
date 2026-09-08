import { Router, Request, Response } from 'express';
import { pingDatabase } from '../database';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Liveness — processo da API no ar
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Processo saudável
 */
router.get('/health', (_req: Request, res: Response) => {
    return res.status(200).json({ status: 'ok' });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness — API pronta para tráfego (Mongo acessível)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Dependências ok
 *       503:
 *         description: Mongo indisponível
 */
router.get('/ready', async (_req: Request, res: Response) => {
    try {
        await pingDatabase();
        return res.status(200).json({ status: 'ok', checks: { mongodb: 'up' } });
    } catch {
        return res.status(503).json({ status: 'unavailable', checks: { mongodb: 'down' } });
    }
});

export default router;
