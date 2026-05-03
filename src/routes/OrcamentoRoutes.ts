import { Router, Request, Response } from 'express';
import { OrcamentoController } from '../controllers/OrcamentoController';
import { OrcamentoService } from '../services/OrcamentoService';
import { OrcamentoRepository } from '../Repository/OrcamentoRepository';
import { Orcamento } from '../Entities/Orcamento';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();
const orcamentoRepo = new OrcamentoRepository();
const orcamentoService = new OrcamentoService(orcamentoRepo);
const orcamentoController = new OrcamentoController(orcamentoService);

// router.post('/orcamentos', authMiddleware, async (req: Request, res: Response) => {
//   try {
//     const { ordemServicoId, versao, status, itensPecas, itensServicos, valorTotal, validadeEm } = req.body;
//     if (!ordemServicoId || !versao || !status || !itensPecas || !itensServicos || valorTotal == null || !validadeEm) {
//       return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
//     }

//     const orcamento = new Orcamento(
//       ordemServicoId,
//       versao,
//       status,
//       itensPecas,
//       itensServicos,
//       valorTotal,
//       new Date(validadeEm),
//       new Date()
//     );

//     const createdOrcamento = await orcamentoController.createOrcamento(orcamento);
//     return res.status(201).json(createdOrcamento);
//   } catch (error: any) {
//     return res.status(500).json({ error: error.message });
//   }
// });

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