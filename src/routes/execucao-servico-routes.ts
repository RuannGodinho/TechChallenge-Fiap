import { Router, Request, Response } from 'express';
import { ExecucaoServicoController } from '../controllers/execucao-servico-controller';
import { ExecucaoServicoService } from '../services/execucao-servico-service';
import { ExecucaoServicoRepository } from '../Repository/execucao-servico-repository';
import { OrdemServicoRepository } from '../Repository/ordem-servico-repository';
import { DIContainer } from '../infrastructure/composition-root/di-container';
import { authMiddleware } from '../infrastructure/http/middlewares/auth-middleware';

const router = Router();

let execucaoServicoControllerPromise: Promise<ExecucaoServicoController> | null = null;

async function getExecucaoServicoController(): Promise<ExecucaoServicoController> {
    if (execucaoServicoControllerPromise) {
        return execucaoServicoControllerPromise;
    }

    execucaoServicoControllerPromise = (async () => {
        const container = DIContainer.getInstance();
        await container.ensureInitialized();
        const servicoService = container.getServicoServiceFacade();
        const execucaoRepo = new ExecucaoServicoRepository();
        const ordemServicoRepo = new OrdemServicoRepository();
        const execucaoServicoService = new ExecucaoServicoService(
            execucaoRepo,
            ordemServicoRepo,
            servicoService
        );
        return new ExecucaoServicoController(execucaoServicoService);
    })();

    return execucaoServicoControllerPromise;
}

router.get('/execucoes-servico/:ordemServicoId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const ordemServicoId = req.params.ordemServicoId as string;

    if (!ordemServicoId) {
      return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
    }

    const execucaoServicoController = await getExecucaoServicoController();
    const execucoesServico = await execucaoServicoController.getExecucoesByOrdemServicoId(ordemServicoId);

    if (!execucoesServico || !execucoesServico.length) {
      return res.status(404).json({
        error: 'Execucao de servico não encontrada para a ordem de serviço informada'
      });
    }

    return res.json(execucoesServico);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/execucoes-servico/:id/iniciar', authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const execucaoServicoController = await getExecucaoServicoController();
    const execucao = await execucaoServicoController.iniciarExecucao(id);

    return res.json(execucao);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }

    if (
      error.message.includes('já iniciado') ||
      error.message.includes('já finalizada') ||
      error.message.includes('não é possível iniciar')
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
});

router.patch('/execucoes-servico/:id/finalizar', authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const execucaoServicoController = await getExecucaoServicoController();
    const execucao = await execucaoServicoController.finalizarExecucao(id);

    return res.json(execucao);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }

    if (
      error.message.includes('não iniciada') ||
      error.message.includes('já finalizada')
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
});

router.get('/metricas/tempo-medio-servicos', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const execucaoServicoController = await getExecucaoServicoController();
    const metrics = await execucaoServicoController.getTempoMedioServicos();

    return res.json(metrics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
