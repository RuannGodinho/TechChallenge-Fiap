import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getOrdemServicoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getOrdemServicoController();
}

router.post('/ordensServico', authMiddleware, async (req: Request, res: Response) => {
    const { cpfCnpj, veiculoId, veiculo, pecas, servicos } = req.body;
    const resolvedVeiculoId = veiculoId ?? veiculo;

    if (!cpfCnpj || !resolvedVeiculoId) {
        return res.status(400).json({ error: 'Cliente e veículo são obrigatórios' });
    }

    try {
        const controller = await getOrdemServicoController();
        const ordem = await controller.createOrdemServico({
            cpfCnpj,
            veiculoId: resolvedVeiculoId,
            pecas: pecas || [],
            servicos: servicos || [],
        });

        return res.status(201).json(ordem);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

router.get('/ordensServico', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getOrdemServicoController();
        const ordens = await controller.listaOrdensServico();
        return res.json(ordens);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

router.put('/ordensServico/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
        }

        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
        }

        const controller = await getOrdemServicoController();
        const ordem = await controller.updateOrdemServico(id, updates);

        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }

        return res.json(ordem);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

router.get('/ordensServico/:cpfCnpj/detalhes', async (req: Request, res: Response) => {
    try {
        const cpfCnpj = req.params.cpfCnpj as string;

        if (!cpfCnpj) {
            return res.status(400).json({ error: 'CPF/CNPJ é obrigatório' });
        }

        const controller = await getOrdemServicoController();
        const ordens = await controller.getOrdensServicoComDetalhesPorCpfCnpj(cpfCnpj);

        return res.json(ordens);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';

        if (message.includes('não encontrada')) {
            return res.status(404).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
});

export default router;
