import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getServicoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getServicoController();
}

router.get('/servicos', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getServicoController();
        const servicos = await controller.getAllServicos();
        return res.json(servicos);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/servicos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do serviço é obrigatório' });
        }

        const controller = await getServicoController();
        const service = await controller.getServicoById(id);

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        return res.json(service);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/servicos', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { nome, descricao, preco } = req.body;

        if (!nome || !descricao || preco == null) {
            return res.status(400).json({ error: 'nome, descricao e preco são obrigatórios' });
        }

        const controller = await getServicoController();
        const service = await controller.createServico({ nome, descricao, preco });
        return res.status(201).json(service);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: `Internal server error ${message}` });
    }
});

router.put('/servicos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do serviço é obrigatório' });
        }

        const { nome, descricao, preco } = req.body;
        const controller = await getServicoController();
        const service = await controller.updateServico(id, { nome, descricao, preco });

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        return res.json(service);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: `Internal server error ${message}` });
    }
});

router.delete('/servicos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do serviço é obrigatório' });
        }

        const controller = await getServicoController();
        const deleted = await controller.deleteServico(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Service not found' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
