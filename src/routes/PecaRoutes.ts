import { Router, Request, Response } from 'express';
import { PecaController } from '../controllers/PecaController';
import { PecaService } from '../services/PecaService';
import { PecaRepository } from '../Repository/PecaRepository';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();
const pecaRepo = new PecaRepository();
const pecaService = new PecaService(pecaRepo);
const pecaController = new PecaController(pecaService);

router.get('/pecas', authMiddleware, async (req: Request, res: Response) => {
  try {
    const pecas = await pecaController.getAllPecas();
    return res.json(pecas);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pecas/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === ':id')
      return res.status(400).json({ error: "ID da peça é obrigatório" });

    const peca = await pecaController.getPecaById(id);

    if (!peca) {
      return res.status(404).json({ error: 'Peca not found' });
    }

    return res.json(peca);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/pecas', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { Nome, Descricao, Tipo, Preco } = req.body;
    if (!Nome || !Descricao || !Tipo || Preco == null) {
      return res.status(400).json({ error: 'Nome, Descricao, Tipo, and Preco are required' });
    }

    const peca = await pecaController.createPeca({ Nome, Descricao, Tipo, Preco });
    return res.status(201).json(peca);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.put('/pecas/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    if (id === ':id')
      return res.status(400).json({ error: "ID da peça é obrigatório" });    

    const { Nome, Descricao, Tipo, Preco } = req.body;

    const peca = await pecaController.updatePeca(id, { Nome, Descricao, Tipo, Preco });

    if (!peca) {
      return res.status(404).json({ error: 'Peca not found' });
    }

    return res.json(peca);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.delete('/pecas/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === ':id')
      return res.status(400).json({ error: "ID da peça é obrigatório" });

    const deleted = await pecaController.deletePeca(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Peca not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
