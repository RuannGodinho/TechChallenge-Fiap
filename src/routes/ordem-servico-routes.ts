import { Router, Request, Response } from 'express';
import { OrdemServicoController } from '../controllers/ordem-servico-controller';
import { OrdemServicoService } from '../services/ordem-servico-service';
import { OrdemServicoRepository } from '../Repository/ordem-servico-repository';
import { DIContainer } from '../infrastructure/composition-root/di-container';
import { PecaRepository } from '../Repository/peca-repository';
import { ServicoRepository } from '../Repository/servico-repository';
import { ServicoService } from '../services/servico-service';
import { EstoqueRepository } from '../Repository/estoque-repository';
import { EstoqueService } from '../services/estoque-service';
import { OrcamentoRepository } from '../Repository/orcamento-repository';
import { OrcamentoService } from '../services/orcamento-service';
import { ExecucaoServicoRepository } from '../Repository/execucao-servico-repository';
import { ExecucaoServicoService } from '../services/execucao-servico-service';
import { MovimentacaoEstoqueRepository } from '../Repository/movimentacao-estoque-repository';
import { authMiddleware } from '../infrastructure/http/middlewares/auth-middleware';

const router = Router();

let ordemServicoControllerPromise: Promise<OrdemServicoController> | null = null;

async function getOrdemServicoController(): Promise<OrdemServicoController> {
  if (ordemServicoControllerPromise) {
    return ordemServicoControllerPromise;
  }

  ordemServicoControllerPromise = (async () => {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    const clienteService = container.getClienteServiceFacade();
    const veiculoService = container.getVeiculoServiceFacade();
    const pecaService = container.getPecaServiceFacade();
    const pecaRepo = new PecaRepository();
    const servicoRepo = new ServicoRepository();
    const servicoService = new ServicoService(servicoRepo);
    const estoqueRepo = new EstoqueRepository();
    const movimentacaoRepo = new MovimentacaoEstoqueRepository();
    const estoqueService = new EstoqueService(estoqueRepo, movimentacaoRepo, pecaRepo);
    const ordemServicoRepo = new OrdemServicoRepository();
    const orcamentoRepo = new OrcamentoRepository();
    const orcamentoService = new OrcamentoService(orcamentoRepo);
    const execucaoServicoRepo = new ExecucaoServicoRepository();
    const execucaoServicoService = new ExecucaoServicoService(
      execucaoServicoRepo,
      ordemServicoRepo,
      servicoService
    );
    const ordemServicoService = new OrdemServicoService(
      ordemServicoRepo,
      clienteService,
      veiculoService,
      pecaService,
      servicoService,
      estoqueService,
      orcamentoService,
      execucaoServicoService
    );

    return new OrdemServicoController(ordemServicoService);
  })();

  return ordemServicoControllerPromise;
}

/**
 * @swagger
 * /api/ordensServico:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria uma nova ordem de serviço
 *     tags: [Ordens de Serviço]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cpfCnpj
 *               - veiculoId
 *             properties:
 *               cpfCnpj:
 *                 type: string
 *               veiculoId:
 *                 type: string
 *               pecas:
 *                 type: array
 *               servicos:
 *                 type: array
 *     responses:
 *       201:
 *         description: Ordem de serviço criada com sucesso
 *       400:
 *         description: Cliente e veículo são obrigatórios
 */
router.post('/ordensServico', authMiddleware, async (req: Request, res: Response) => {
  const { cpfCnpj, veiculoId, pecas, servicos } = req.body;

  if (!cpfCnpj || !veiculoId) {
    return res.status(400).json({ error: 'Cliente e veículo são obrigatórios' });
  }

  try {
    const ordemServicoController = await getOrdemServicoController();
    const ordem = await ordemServicoController.createOrdemServico({
      cpfCnpj: cpfCnpj,
      veiculo: veiculoId,
      pecas: pecas || [],
      servicos: servicos || []
    } as any);

    return res.status(201).json(ordem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ordensServico:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista todas as ordens de serviço
 *     tags: [Ordens de Serviço]
 *     responses:
 *       200:
 *         description: Ordens de serviço retornadas com sucesso
 */
router.get('/ordensServico', authMiddleware, async (req: Request, res: Response) => {
  try {
    const ordemServicoController = await getOrdemServicoController();
    const ordens = await ordemServicoController.listaOrdensServico();
    return res.json(ordens);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ordensServico/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza uma ordem de serviço
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da ordem de serviço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cpfCnpj:
 *                 type: string
 *               veiculoId:
 *                 type: string
 *               pecas:
 *                 type: array
 *               servicos:
 *                 type: array
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ordem de serviço atualizada com sucesso
 *       404:
 *         description: Ordem de serviço não encontrada
 *       400:
 *         description: ID obrigatório ou campos inválidos
 */
router.put('/ordensServico/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (id === ':id')
      return res.status(400).json({ error: "ID da ordem de serviço é obrigatório" });

    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
    }

    const ordemServicoController = await getOrdemServicoController();
    const ordem = await ordemServicoController.updateOrdemServico(id, updates);

    if (!ordem) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    return res.json(ordem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/ordensServico/{cpfCnpj}/detalhes:
 *   get:
 *     summary: Obtém ordens de serviço do cliente pelo CPF/CNPJ com todos os detalhes
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: query
 *         name: cpfCnpj
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF ou CNPJ do cliente
 *     responses:
 *       200:
 *         description: Ordens de serviço com detalhes retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   cpfCnpj:
 *                     type: string
 *                   status:
 *                     type: string
 *                   dataAbertura:
 *                     type: string
 *                     format: date-time
 *                   dataInicioServico:
 *                     type: string
 *                     format: date-time
 *                   dataFechamento:
 *                     type: string
 *                     format: date-time
 *                   valorTotal:
 *                     type: number
 *                   veiculo:
 *                     type: object
 *                     properties:
 *                       placa:
 *                         type: string
 *                       modelo:
 *                         type: string
 *                       ano:
 *                         type: number
 *                       marca:
 *                         type: string
 *                   pecas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         peca:
 *                           type: object
 *                         quantidade:
 *                           type: number
 *                         valorUnitario:
 *                           type: number
 *                         subtotal:
 *                           type: number
 *                   servicos:
 *                     type: array
 *                     items:
 *                       type: object
 *       400:
 *         description: CPF/CNPJ obrigatório
 *       404:
 *         description: Ordem de serviço não encontrada
 *       500:
 *         description: Erro ao buscar ordem de serviço
 */
router.get('/ordensServico/:cpfCnpj/detalhes', async (req: Request, res: Response) => {
  try {
    const cpfCnpj = req.params.cpfCnpj as string;

    if (!cpfCnpj) {
      return res.status(400).json({ error: "CPF/CNPJ é obrigatório" });
    }

    const ordemServicoController = await getOrdemServicoController();
    const ordens = await ordemServicoController.getOrdensServicoComDetalhesPorCpfCnpj(cpfCnpj);

    return res.json(ordens);
  } catch (error: any) {
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
});

export default router;