import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getExecucaoServicoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getExecucaoServicoController();
}

router.get('/execucoes-servico/:ordemServicoId', authMiddleware, async (req: Request, res: Response) => {
    try {
        const ordemServicoId = req.params.ordemServicoId as string;

        if (!ordemServicoId) {
            return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
        }

        const controller = await getExecucaoServicoController();
        const execucoesServico = await controller.getExecucoesByOrdemServicoId(ordemServicoId);

        if (!execucoesServico.length) {
            return res.status(404).json({
                error: 'Execucao de servico não encontrada para a ordem de serviço informada',
            });
        }

        return res.json(execucoesServico);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

router.patch('/execucoes-servico/:id/iniciar', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const controller = await getExecucaoServicoController();
        const execucao = await controller.iniciarExecucao(id);

        return res.json(execucao);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';

        if (message.includes('não encontrada')) {
            return res.status(404).json({ error: message });
        }

        if (
            message.includes('já iniciada') ||
            message.includes('já finalizada') ||
            message.includes('não é possível iniciar')
        ) {
            return res.status(400).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
});

router.patch('/execucoes-servico/:id/finalizar', authMiddleware, async (req: Request, res: Response) => {
    const id = req.params.id as string;

    try {
        const controller = await getExecucaoServicoController();
        const execucao = await controller.finalizarExecucao(id);

        return res.json(execucao);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';

        if (message.includes('não encontrada')) {
            return res.status(404).json({ error: message });
        }

        if (message.includes('não iniciada') || message.includes('já finalizada')) {
            return res.status(400).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
});

router.get('/metricas/tempo-medio-servicos', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getExecucaoServicoController();
        const metrics = await controller.getTempoMedioServicos();

        return res.json(metrics);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

export default router;
