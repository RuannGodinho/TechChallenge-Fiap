import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getExecucaoServicoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getExecucaoServicoController();
}

/**
 * @swagger
 * /api/execucoes-servico/{ordemServicoId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista execuções de serviço por ordem de serviço
 *     tags: [Execução de Serviço]
 *     parameters:
 *       - in: path
 *         name: ordemServicoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execuções retornadas com sucesso
 *       404:
 *         description: Execuções não encontradas
 *       400:
 *         description: ID da ordem de serviço obrigatório
 */
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

/**
 * @swagger
 * /api/execucoes-servico/{id}/iniciar:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Inicia uma execução de serviço
 *     tags: [Execução de Serviço]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execução iniciada com sucesso
 *       404:
 *         description: Execução não encontrada
 *       400:
 *         description: Execução não pode ser iniciada
 */
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

/**
 * @swagger
 * /api/execucoes-servico/{id}/finalizar:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Finaliza uma execução de serviço
 *     tags: [Execução de Serviço]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Execução finalizada com sucesso
 *       404:
 *         description: Execução não encontrada
 *       400:
 *         description: Execução não pode ser finalizada
 */
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

/**
 * @swagger
 * /api/metricas/tempo-medio-servicos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtém tempo médio de execução dos serviços
 *     tags: [Execução de Serviço]
 *     responses:
 *       200:
 *         description: Métricas retornadas com sucesso
 */
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
