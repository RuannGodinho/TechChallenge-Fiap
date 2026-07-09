import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getOrdemServicoController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getOrdemServicoController();
}

/**
 * @swagger
 * /api/ordensServico:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria uma ordem de serviço
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
 *               veiculo:
 *                 type: string
 *                 description: Alias para veiculoId
 *               pecas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pecaId:
 *                       type: string
 *                     quantidade:
 *                       type: number
 *               servicos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Ordem de serviço criada com sucesso
 *       400:
 *         description: Cliente e veículo são obrigatórios
 */
router.post('/ordensServico', authMiddleware, async (req: Request, res: Response) => {
    const { cpfCnpj, veiculoId, veiculo, pecas, servicos } = req.body;
    const resolvedVeiculoId = veiculoId ?? veiculo;

    if (!cpfCnpj || !resolvedVeiculoId) {
        return res.status(400).json({ error: 'Cliente e veículo são obrigatórios' });
    }

    try {
        const controller = await getOrdemServicoController();
        const ordem = await controller.createOrdemServico({
            cpfCnpj,
            veiculoId: resolvedVeiculoId,
            pecas: pecas || [],
            servicos: servicos || [],
        });

        return res.status(201).json(ordem);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/ordensServico:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista ordens de serviço
 *     tags: [Ordens de Serviço]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/ordensServico', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getOrdemServicoController();
        const ordens = await controller.listaOrdensServico();
        return res.json(ordens);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
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
 *               veiculo:
 *                 type: string
 *               status:
 *                 type: string
 *               pecas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     pecaId:
 *                       type: string
 *                     quantidade:
 *                       type: number
 *               servicos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Ordem de serviço atualizada com sucesso
 *       404:
 *         description: Ordem de serviço não encontrada
 *       400:
 *         description: ID ou campos de atualização inválidos
 */
router.put('/ordensServico/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID da ordem de serviço é obrigatório' });
        }

        const updates = req.body;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
        }

        const controller = await getOrdemServicoController();
        const ordem = await controller.updateOrdemServico(id, updates);

        if (!ordem) {
            return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
        }

        return res.json(ordem);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/ordensServico/{cpfCnpj}/detalhes:
 *   get:
 *     summary: Busca ordens de serviço com detalhes por CPF/CNPJ
 *     tags: [Ordens de Serviço]
 *     parameters:
 *       - in: path
 *         name: cpfCnpj
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ordens retornadas com sucesso
 *       404:
 *         description: Cliente ou ordens não encontradas
 *       400:
 *         description: CPF/CNPJ obrigatório
 */
router.get('/ordensServico/:cpfCnpj/detalhes', async (req: Request, res: Response) => {
    try {
        const cpfCnpj = req.params.cpfCnpj as string;

        if (!cpfCnpj) {
            return res.status(400).json({ error: 'CPF/CNPJ é obrigatório' });
        }

        const controller = await getOrdemServicoController();
        const ordens = await controller.getOrdensServicoComDetalhesPorCpfCnpj(cpfCnpj);

        return res.json(ordens);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';

        if (message.includes('não encontrada')) {
            return res.status(404).json({ error: message });
        }

        return res.status(500).json({ error: message });
    }
});

export default router;
