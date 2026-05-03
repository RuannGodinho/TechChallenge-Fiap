import { Router, Request, Response } from 'express';
import { EstoqueController } from '../controllers/estoque-controller';
import { EstoqueService } from '../services/estoque-service';
import { EstoqueRepository } from '../Repository/estoque-repository';
import { MovimentacaoEstoqueRepository } from '../Repository/movimentacao-estoque-repository';
import { PecaRepository } from '../Repository/peca-repository';
import { authMiddleware } from '../middleware/auth-middleware';

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
    const { pecaId, tipo, quantidade, origem } = req.body;
    if (!pecaId || !tipo || quantidade == null ) {
      return res.status(400).json({ error: 'pecaId, tipo e quantidade são obrigatórios' });
    }

    const movimentacao = await estoqueController.createMovimentacao({
      pecaId,
      tipo,
      quantidade,
      data: new Date(Date.now()),
      origem,
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
