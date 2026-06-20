import { Router, Request, Response } from 'express';
import { VeiculoController } from '../controllers/veiculo-controller';
import { VeiculoService } from '../services/veiculo-service';
import { VeiculoRepository } from '../Repository/veiculo-repository';
import { authMiddleware } from '../infrastructure/http/middlewares/auth-middleware';

const router = Router();

const VeiculoRepo = new VeiculoRepository();
const veiculoService = new VeiculoService(VeiculoRepo);
const veiculoController = new VeiculoController(veiculoService);

/**
 * @swagger
 * /api/veiculos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista todos os veículos
 *     tags: [Veículos]
 *     responses:
 *       200:
 *         description: Veículos retornados com sucesso
 */
router.get("/veiculos", authMiddleware, async (req: Request, res: Response) => {
    try {
        const Veiculos = await veiculoController.getAllVeiculos();
        return res.json(Veiculos);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/veiculos/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Busca veículo por ID
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *     responses:
 *       200:
 *         description: Veículo encontrado
 *       404:
 *         description: Veículo não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.get("/veiculos/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do veículo é obrigatório" });

        const Veiculo = await veiculoController.getVeiculoById(id);

        if (!Veiculo) {
            return res.status(404).json({ error: "Veiculo not found" });
        }

        return res.json(Veiculo);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/veiculos:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria um novo veículo
 *     tags: [Veículos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placa
 *               - modelo
 *               - ano
 *               - marca
 *             properties:
 *               placa:
 *                 type: string
 *               modelo:
 *                 type: string
 *               ano:
 *                 type: number
 *               marca:
 *                 type: string
 *     responses:
 *       201:
 *         description: Veículo criado com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 */
router.post("/veiculos", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { placa, modelo, ano, marca } = req.body;
        if (!placa || !modelo || !ano || !marca)
            return res.status(400).json({ error: "placa, modelo, ano e marca são obrigatórios" });

        const veiculo = await veiculoController.criarVeiculo({ placa, modelo, ano, marca });
        return res.status(201).json(veiculo);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/veiculos/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *               modelo:
 *                 type: string
 *               ano:
 *                 type: number
 *               marca:
 *                 type: string
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso
 *       404:
 *         description: Veículo não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.put("/veiculos/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do veículo é obrigatório" });

        const { placa, modelo, ano, marca } = req.body;

        const veiculo = await veiculoController.atualizarVeiculo(id, { placa, modelo, ano, marca });

        if (!veiculo) {
            return res.status(404).json({ error: "Veiculo not found" });
        }

        return res.json(veiculo);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/veiculos/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Deleta um veículo
 *     tags: [Veículos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do veículo
 *     responses:
 *       204:
 *         description: Veículo deletado com sucesso
 *       404:
 *         description: Veículo não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.delete("/veiculos/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do veículo é obrigatório" });

        const deleted = await veiculoController.deletarVeiculo(id);

        if (!deleted) {
            return res.status(404).json({ error: "Veiculo not found" });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;