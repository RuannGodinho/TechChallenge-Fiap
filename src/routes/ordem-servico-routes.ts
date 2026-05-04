import { Router, Request, Response } from 'express';
import { OrdemServicoController } from '../controllers/ordem-servico-controller';
import { OrdemServicoService } from '../services/ordem-servico-service';
import { OrdemServicoRepository } from '../Repository/ordem-servico-repository';
import { ClienteService } from '../services/cliente-service';
import { ClienteRepository } from '../Repository/cliente-repository';
import { VeiculoService } from '../services/veiculo-service';
import { VeiculoRepository } from '../Repository/veiculo-repository';
import { PecaRepository } from '../Repository/peca-repository';
import { PecaService } from '../services/peca-service';
import { ServicoRepository } from '../Repository/servico-repository';
import { ServicoService } from '../services/servico-service';
import { EstoqueRepository } from '../Repository/estoque-repository';
import { EstoqueService } from '../services/estoque-service';
import { OrcamentoRepository } from '../Repository/orcamento-repository';
import { OrcamentoService } from '../services/orcamento-service';
import { MovimentacaoEstoqueRepository } from '../Repository/movimentacao-estoque-repository';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();
const clienteRepo = new ClienteRepository();
const clienteService = new ClienteService(clienteRepo);
const veiculoRepo = new VeiculoRepository();
const veiculoService = new VeiculoService(veiculoRepo);
const pecaRepo = new PecaRepository();
const pecaService = new PecaService(pecaRepo);
const servicoRepo = new ServicoRepository();
const servicoService = new ServicoService(servicoRepo);
const estoqueRepo = new EstoqueRepository();
const movimentacaoRepo = new MovimentacaoEstoqueRepository();
const estoqueService = new EstoqueService(estoqueRepo, movimentacaoRepo, pecaRepo);
const ordemServicoRepo = new OrdemServicoRepository();
const orcamentoRepo = new OrcamentoRepository();
const orcamentoService = new OrcamentoService(orcamentoRepo);
const ordemServicoService = new OrdemServicoService(ordemServicoRepo, clienteService, veiculoService, pecaService, servicoService, estoqueService, orcamentoService);
const ordemServicoController = new OrdemServicoController(ordemServicoService);

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

    const ordem = await ordemServicoController.updateOrdemServico(id, updates);

    if (!ordem) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    return res.json(ordem);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;