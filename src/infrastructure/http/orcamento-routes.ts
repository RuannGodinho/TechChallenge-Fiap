import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getOrcamentoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getOrcamentoController();
}

/**
 * @swagger
 * /api/orcamentos/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza um orçamento
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ordemServicoId:
 *                 type: string
 *               versao:
 *                 type: number
 *               status:
 *                 type: string
 *                 description: Ex. PENDENTE, APROVADO, REPROVADO
 *               valorTotal:
 *                 type: number
 *               validadeEm:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Orçamento atualizado com sucesso
 *       404:
 *         description: Orçamento não encontrado
 *       400:
 *         description: ID ou campos de atualização inválidos
 */
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

/**
 * @swagger
 * /api/orcamentos/{ordemServicoId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista orçamentos por ordem de serviço
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: ordemServicoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orçamentos retornados com sucesso
 *       404:
 *         description: Orçamento não encontrado para a ordem informada
 *       400:
 *         description: ID da ordem de serviço obrigatório
 */
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
