import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getVeiculoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getVeiculoController();
}

router.get('/veiculos', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getVeiculoController();
        const veiculos = await controller.getAllVeiculos();
        return res.json(veiculos);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/veiculos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do veículo é obrigatório' });
        }

        const controller = await getVeiculoController();
        const veiculo = await controller.getVeiculoById(id);

        if (!veiculo) {
            return res.status(404).json({ error: 'Veiculo not found' });
        }

        return res.json(veiculo);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/veiculos', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { placa, modelo, ano, marca } = req.body;

        if (!placa || !modelo || !ano || !marca) {
            return res.status(400).json({ error: 'placa, modelo, ano e marca são obrigatórios' });
        }

        const controller = await getVeiculoController();
        const veiculo = await controller.criarVeiculo({ placa, modelo, ano, marca });
        return res.status(201).json(veiculo);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

router.put('/veiculos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do veículo é obrigatório' });
        }

        const controller = await getVeiculoController();
        const veiculo = await controller.atualizarVeiculo(id, req.body);

        if (!veiculo) {
            return res.status(404).json({ error: 'Veiculo not found' });
        }

        return res.json(veiculo);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

router.delete('/veiculos/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do veículo é obrigatório' });
        }

        const controller = await getVeiculoController();
        const deleted = await controller.deletarVeiculo(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Veiculo not found' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
