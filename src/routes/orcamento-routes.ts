import { Router, Request, Response } from 'express';
import { OrcamentoController } from '../controllers/orcamento-controller';
import { OrcamentoService } from '../services/orcamento-service';
import { OrcamentoRepository } from '../Repository/orcamento-repository';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();
const orcamentoRepo = new OrcamentoRepository();
const orcamentoService = new OrcamentoService(orcamentoRepo);
const orcamentoController = new OrcamentoController(orcamentoService);

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
 *         description: ID do orçamento
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
 *               itensPecas:
 *                 type: array
 *               itensServicos:
 *                 type: array
 *               valorTotal:
 *                 type: number
 *               validadeEm:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Orçamento atualizado com sucesso
 *       404:
 *         description: Orçamento não encontrado
 *       400:
 *         description: ID obrigatório ou campos inválidos
 */
router.put('/orcamentos/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === ':id')
      return res.status(400).json({ error: "ID do orçamento é obrigatório" });

    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
    }

    const orcamento = await orcamentoController.updateOrcamento(id, updates);

    if (!orcamento) {
      return res.status(404).json({ error: 'Orçamento não encontrado' });
    }

    return res.json(orcamento);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/orcamentos/{ordemServicoId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtém orçamentos pelo ID da ordem de serviço
 *     tags: [Orçamentos]
 *     parameters:
 *       - in: path
 *         name: ordemServicoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da ordem de serviço
 *     responses:
 *       200:
 *         description: Orçamentos retornados com sucesso
 *       400:
 *         description: ID da ordem de serviço obrigatório
 *       404:
 *         description: Orçamento não encontrado
 *       500:
 *         description: Erro ao buscar orçamentos
 */
router.get('/orcamentos/:ordemServicoId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const ordemServicoId = req.params.ordemServicoId as string;

    if (!ordemServicoId) {
      return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
    }

    const orcamentos = await orcamentoController.getOrcamentosByOrdemServicoId(ordemServicoId);

    if (!orcamentos || !orcamentos.length) {
      return res.status(404).json({ error: 'Orçamento não encontrado para a ordem de serviço informada' });
    }

    return res.json(orcamentos);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;