import { Router, Request, Response } from 'express';
import { EstoqueController } from '../controllers/EstoqueController';
import { EstoqueService } from '../services/EstoqueService';
import { EstoqueRepository } from '../Repository/EstoqueRepository';
import { MovimentacaoEstoqueRepository } from '../Repository/MovimentacaoEstoqueRepository';
import { PecaRepository } from '../Repository/PecaRepository';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();
const estoqueRepo = new EstoqueRepository();
const movimentacaoRepo = new MovimentacaoEstoqueRepository();
const pecaRepository = new PecaRepository();
const estoqueService = new EstoqueService(estoqueRepo, movimentacaoRepo, pecaRepository);
const estoqueController = new EstoqueController(estoqueService);

router.get('/estoque', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const estoque = await estoqueController.getAllEstoque();
    return res.json(estoque);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/estoque/movimentacoes', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const estoque = await estoqueController.listaMovimentacoes();
    return res.json(estoque);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/estoque/:pecaId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pecaId = req.params.pecaId as string;

    if (pecaId === ':pecaId')
      return res.status(400).json({ error: "ID da peça é obrigatório" });

    const estoque = await estoqueController.getEstoqueByPecaId(pecaId);

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
    const { PecaId, Tipo, Quantidade, Origem } = req.body;
    if (!PecaId || !Tipo || Quantidade == null ) {
      return res.status(400).json({ error: 'PecaId, Tipo and Quantidade are required' });
    }

    const movimentacao = await estoqueController.createMovimentacao({
      PecaId,
      Tipo,
      Quantidade,
      Data: new Date(Date.now()),
      Origem,
    });

    return res.status(201).json(movimentacao);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

router.delete('/estoque/:pecaId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pecaId = req.params.pecaId as string;

    if (pecaId === ':pecaId')
      return res.status(400).json({ error: "ID da peça é obrigatório" });

    const deleted = await estoqueController.deleteEstoque(pecaId);

    if (!deleted) {
        return res.status(404).json({ error: "Estoque não encontrado" });
    }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});


export default router;
