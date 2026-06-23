import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getOrcamentoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getOrcamentoController();
}

router.put('/orcamentos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do orçamento é obrigatório' });
        }

        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
        }

        const controller = await getOrcamentoController();
        const orcamento = await controller.updateOrcamento(id, updates);

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        return res.json(orcamento);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';

        if (message.includes('Status inválido')) {
            return res.status(400).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
});

router.get('/orcamentos/:ordemServicoId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const ordemServicoId = req.params.ordemServicoId as string;

        if (!ordemServicoId) {
            return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
        }

        const controller = await getOrcamentoController();
        const orcamentos = await controller.getOrcamentosByOrdemServicoId(ordemServicoId);

        if (!orcamentos.length) {
            return res.status(404).json({
                error: 'Orçamento não encontrado para a ordem de serviço informada',
            });
        }

        return res.json(orcamentos);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

export default router;
