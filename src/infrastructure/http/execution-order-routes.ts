import { Router, Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { ExecutionOrderController } from '../../Adapters/controllers/execution-order.controller';
import { OrderCompletionConflict } from '../../application/ports/order-completion.port';

export function createExecutionOrderRoutes(getController: () => Promise<ExecutionOrderController>) {
    const router = Router();
    router.use((req: Request, res: Response, next: NextFunction) => {
        const expected = process.env.SERVICE_ORDERS_INTERNAL_API_KEY;
        const provided = req.header('x-internal-api-key');
        if (!expected || !provided || Buffer.byteLength(expected) !== Buffer.byteLength(provided) || !timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) return res.status(401).json({ error: 'unauthorized' });
        return next();
    });
    router.param('id', (_req, res, next, id) => ObjectId.isValid(id) ? next() : res.status(400).json({ error: 'ID inválido' }));
    router.get('/ordensServico/:id', async (req, res) => {
        try {
            const order = await (await getController()).buscarOrdemServicoPorId(String(req.params.id));
            return order ? res.json(order) : res.status(404).json({ error: 'Ordem não encontrada' });
        } catch { return res.status(503).json({ error: 'database unavailable' }); }
    });
    router.patch('/ordensServico/:id/finalizar', async (req, res) => {
        try {
            const order = await (await getController()).finalizar(String(req.params.id));
            return order ? res.json(order) : res.status(404).json({ error: 'Ordem não encontrada' });
        } catch (error) {
            return res.status(error instanceof OrderCompletionConflict ? 409 : 502).json({ error: error instanceof Error ? error.message : 'Finalização indisponível; repita a operação' });
        }
    });
    return router;
}
