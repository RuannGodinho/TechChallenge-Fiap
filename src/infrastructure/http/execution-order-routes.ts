import { Router, Request, Response, NextFunction } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { DIContainer } from '../composition-root/di-container';
import { OrdemServicoPresenter } from '../../Adapters/presenters/ordem-servico.presenter';
import { ServiceHttpClient } from '../../Adapters/adapters/service-http.adapter';

export function completionMessageId(orderId: string): string {
    const hex = createHash('sha256').update(`execution-complete:${orderId}`).digest('hex');
    return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

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
        const container = DIContainer.getInstance(); await container.ensureInitialized();
        const order = await container.getOrdemServicoController().buscarOrdemServicoPorId(String(req.params.id));
        return order ? res.json(order) : res.status(404).json({ error: 'Ordem não encontrada' });
    } catch { return res.status(503).json({ error: 'database unavailable' }); }
});
router.patch('/ordensServico/:id/finalizar', async (req, res) => {
    try {
        const container = DIContainer.getInstance(); await container.ensureInitialized();
        const gateway = container.getOrdemServicoGateway();
        if (!gateway.finalizeExecution) throw new Error('Finalização não configurada');
        const id = String(req.params.id);
        const order = await gateway.finalizeExecution(id);
        if (!order) return res.status(404).json({ error: 'Ordem não encontrada' });
        if (!['FINALIZADA', 'ENTREGUE'].includes(order.status.value)) return res.status(409).json({ error: 'Ordem não está em execução' });
        // The order transition is persisted first. Repeating this endpoint retries notification.
        const billing = new ServiceHttpClient(process.env.BILLING_SERVICE_URL, 'Billing', process.env.BILLING_INTERNAL_API_KEY);
        await billing.request(`/internal/orders/${encodeURIComponent(id)}/execution-complete`, 'POST', { messageId: completionMessageId(id) });
        return res.json(new OrdemServicoPresenter().present(order));
    } catch (error) { return res.status(502).json({ error: error instanceof Error ? error.message : 'Finalização indisponível; repita a operação' }); }
});
export default router;
