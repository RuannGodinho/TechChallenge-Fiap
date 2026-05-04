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

export default router;