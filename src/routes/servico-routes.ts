import { Router, Request, Response } from 'express';
import { ServicoController } from '../controllers/servico-controller';
import { ServicoService } from '../services/servico-service';
import { ServicoRepository } from '../Repository/servico-repository';
import { authMiddleware } from '../infrastructure/http/middlewares/auth-middleware';

const router = Router();

const servicoRepo = new ServicoRepository();
const servicoService = new ServicoService(servicoRepo);
const servicoController = new ServicoController(servicoService);

/**
 * @swagger
 * /api/servicos:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista todos os serviços
 *     tags: [Serviços]
 *     responses:
 *       200:
 *         description: Serviços retornados com sucesso
 */
router.get("/servicos", authMiddleware, async (req: Request, res: Response) => {
    try {
        const servicos = await servicoController.getAllServicos();
        return res.json(servicos);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/servicos/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Busca serviço por ID
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do serviço
 *     responses:
 *       200:
 *         description: Serviço encontrado
 *       404:
 *         description: Serviço não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.get("/servicos/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do serviço é obrigatório" });

        const service = await servicoController.getServicoById(id);

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        return res.json(service);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @swagger
 * /api/servicos:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria um novo serviço
 *     tags: [Serviços]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - descricao
 *               - preco
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       201:
 *         description: Serviço criado com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 */
router.post("/servicos", authMiddleware, async (req: Request, res: Response) => {
    try {
        const { nome, descricao, preco } = req.body;
        if (!nome || !descricao || preco == null)
            return res.status(400).json({ error: "nome, descricao e preco são obrigatórios" });

        const service = await servicoController.createServico({ nome, descricao, preco });
        return res.status(201).json(service);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

/**
 * @swagger
 * /api/servicos/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza um serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do serviço
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Serviço atualizado com sucesso
 *       404:
 *         description: Serviço não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.put("/servicos/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do serviço é obrigatório" });

        const { nome, descricao, preco } = req.body;

        const service = await servicoController.updateServico(id, { nome, descricao, preco });

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        return res.json(service);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

/**
 * @swagger
 * /api/servicos/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Deleta um serviço
 *     tags: [Serviços]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do serviço
 *     responses:
 *       204:
 *         description: Serviço deletado com sucesso
 *       404:
 *         description: Serviço não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.delete("/servicos/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do serviço é obrigatório" });

        const deleted = await servicoController.deleteServico(id);

        if (!deleted) {
            return res.status(404).json({ error: "Service not found" });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;