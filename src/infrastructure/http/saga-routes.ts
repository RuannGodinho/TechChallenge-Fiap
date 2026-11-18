import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { authMiddleware } from './middlewares/auth-middleware';
import { createSagaController } from '../composition-root/saga-container';

export function createSagaRoutes() {
    const router = Router();
    router.get('/ordensServico/:id/saga', authMiddleware, async (req, res) => { if (!ObjectId.isValid(String(req.params.id)))
        return res.status(400).json({ error: 'ID inválido' }); try {
        const r = await (await createSagaController()).consultar(String(req.params.id));
        return r ? res.json(r) : res.status(404).json({ error: 'Saga não encontrada' });
    }
    catch {
        return res.status(503).json({ error: 'Saga indisponível' });
    } });
    router.post('/ordensServico/:id/saga/cancelar', authMiddleware, async (req, res) => { if (!ObjectId.isValid(String(req.params.id)))
        return res.status(400).json({ error: 'ID inválido' }); try {
        await (await createSagaController()).cancelar(String(req.params.id));
        return res.status(202).json({ message: 'Compensação solicitada' });
    }
    catch (e) {
        return res.status(409).json({ error: e instanceof Error ? e.message : 'Falha' });
    } });
    return router;
}
