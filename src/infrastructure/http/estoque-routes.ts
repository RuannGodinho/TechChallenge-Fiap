import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getEstoqueController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getEstoqueController();
}

router.get('/estoque', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getEstoqueController();
        const estoque = await controller.getAllEstoque();
        return res.json(estoque);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/estoque/movimentacoes', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getEstoqueController();
        const movimentacoes = await controller.listaMovimentacoes();
        return res.json(movimentacoes);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/estoque/:pecaId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const pecaId = req.params.pecaId as string;

        if (pecaId === ':pecaId') {
            return res.status(400).json({ error: 'ID da peça é obrigatório' });
        }

        const controller = await getEstoqueController();
        const estoque = await controller.getEstoqueByPecaId(pecaId);

        if (!estoque) {
            return res.status(404).json({ error: 'Estoque not found' });
        }

        return res.json(estoque);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/estoque/movimentacoes', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { pecaId, tipo, quantidade, origem } = req.body;

        if (!pecaId || !tipo || quantidade == null || !origem) {
            return res.status(400).json({
                error: 'pecaId, tipo, quantidade e origem são obrigatórios',
            });
        }

        const controller = await getEstoqueController();
        const movimentacao = await controller.createMovimentacao({
            pecaId,
            tipo,
            quantidade,
            data: new Date(),
            origem,
        });

        return res.status(201).json(movimentacao);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

export default router;
