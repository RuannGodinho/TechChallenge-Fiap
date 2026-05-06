import { Router, Request, Response } from 'express';
import { ExecucaoServicoController } from '../controllers/execucao-servico-controller';
import { ExecucaoServicoService } from '../services/execucao-servico-service';
import { ExecucaoServicoRepository } from '../Repository/execucao-servico-repository';
import { OrdemServicoRepository } from '../Repository/ordem-servico-repository';
import { ServicoRepository } from '../Repository/servico-repository';
import { ServicoService } from '../services/servico-service';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();
const execucaoRepo = new ExecucaoServicoRepository();
const ordemServicoRepo = new OrdemServicoRepository();
const servicoRepo = new ServicoRepository();
const servicoService = new ServicoService(servicoRepo);
const execucaoServicoService = new ExecucaoServicoService(execucaoRepo, ordemServicoRepo, servicoService);
const execucaoServicoController = new ExecucaoServicoController(execucaoServicoService);

router.post('/execucoes-servico', authMiddleware, async (req: Request, res: Response) => {
  const { ordemServicoId, servicoId } = req.body;

  if (!ordemServicoId || !servicoId) {
    return res.status(400).json({ error: 'ordemServicoId e servicoId são obrigatórios' });
  }

  try {
    const execucao = await execucaoServicoController.createExecucaoServico({ ordemServicoId, servicoId });
    return res.status(201).json(execucao);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/execucoes-servico/:id/iniciar', authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const execucao = await execucaoServicoController.iniciarExecucao(id);
    return res.json(execucao);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('já iniciado') || error.message.includes('já finalizada') || error.message.includes('não é possível iniciar')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/execucoes-servico/:id/finalizar', authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const execucao = await execucaoServicoController.finalizarExecucao(id);
    return res.json(execucao);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('não iniciada') || error.message.includes('já finalizada')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

router.get('/metricas/tempo-medio-servicos', authMiddleware, async (req: Request, res: Response) => {
  try {
    const metrics = await execucaoServicoController.getTempoMedioServicos();
    return res.json(metrics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
