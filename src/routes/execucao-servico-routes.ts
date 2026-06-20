import { Router, Request, Response } from 'express';
import { ExecucaoServicoController } from '../controllers/execucao-servico-controller';
import { ExecucaoServicoService } from '../services/execucao-servico-service';
import { ExecucaoServicoRepository } from '../Repository/execucao-servico-repository';
import { OrdemServicoRepository } from '../Repository/ordem-servico-repository';
import { ServicoRepository } from '../Repository/servico-repository';
import { ServicoService } from '../services/servico-service';
import { authMiddleware } from '../infrastructure/http/middlewares/auth-middleware';

const router = Router();
const execucaoRepo = new ExecucaoServicoRepository();
const ordemServicoRepo = new OrdemServicoRepository();
const servicoRepo = new ServicoRepository();
const servicoService = new ServicoService(servicoRepo);
const execucaoServicoService = new ExecucaoServicoService(execucaoRepo, ordemServicoRepo, servicoService);
const execucaoServicoController = new ExecucaoServicoController(execucaoServicoService);


/**
 * @swagger
 * /api/execucoes-servico/{ordemServicoId}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtém execuções de serviço pelo ID da ordem de serviço
 *     tags: [Execução de Serviços]
 *     parameters:
 *       - in: path
 *         name: ordemServicoId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da ordem de serviço
 *     responses:
 *       200:
 *         description: Execuções de serviço retornadas com sucesso
 *       400:
 *         description: ID da ordem de serviço obrigatório
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Execução de serviço não encontrada
 *       500:
 *         description: Erro ao buscar execuções de serviço
 */
router.get('/execucoes-servico/:ordemServicoId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const ordemServicoId = req.params.ordemServicoId as string;

    if (!ordemServicoId) {
      return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
    }

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

/**
 * @swagger
 * /api/execucoes-servico/{id}/iniciar:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Inicia uma execução de serviço
 *     tags: [Execução de Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da execução de serviço
 *     responses:
 *       200:
 *         description: Execução de serviço iniciada com sucesso
 *       400:
 *         description: Não é possível iniciar a execução de serviço
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Execução de serviço não encontrada
 *       500:
 *         description: Erro ao iniciar execução de serviço
 */
router.patch('/execucoes-servico/:id/iniciar', authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
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

/**
 * @swagger
 * /api/execucoes-servico/{id}/finalizar:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     summary: Finaliza uma execução de serviço
 *     tags: [Execução de Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da execução de serviço
 *     responses:
 *       200:
 *         description: Execução de serviço finalizada com sucesso
 *       400:
 *         description: Não é possível finalizar a execução de serviço
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Execução de serviço não encontrada
 *       500:
 *         description: Erro ao finalizar execução de serviço
 */
router.patch('/execucoes-servico/:id/finalizar', authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
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

/**
 * @swagger
 * /api/metricas/tempo-medio-servicos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Obtém métricas de tempo médio dos serviços
 *     tags: [Métricas]
 *     responses:
 *       200:
 *         description: Métricas retornadas com sucesso
 *       401:
 *         description: Não autenticado
 *       500:
 *         description: Erro ao buscar métricas dos serviços
 */
router.get('/metricas/tempo-medio-servicos', authMiddleware, async (req: Request, res: Response) => {
  try {
    const metrics = await execucaoServicoController.getTempoMedioServicos();

    return res.json(metrics);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
