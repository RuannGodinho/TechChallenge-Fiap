import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getPecaController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getPecaController();
}

/**
 * @swagger
 * /api/pecas:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista peças
 *     tags: [Peças]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/pecas', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getPecaController();
        const pecas = await controller.getAllPecas();
        return res.json(pecas);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/pecas/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Busca peça por ID
 *     tags: [Peças]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Peça encontrada
 *       404:
 *         description: Peça não encontrada
 *       400:
 *         description: ID obrigatório
 */
router.get('/pecas/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID da peça é obrigatório' });
        }

        const controller = await getPecaController();
        const peca = await controller.getPecaById(id);

        if (!peca) {
            return res.status(404).json({ error: 'Peca not found' });
        }

        return res.json(peca);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/pecas:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria uma peça
 *     tags: [Peças]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - descricao
 *               - tipo
 *               - preco
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [PECA, INSUMO]
 *               preco:
 *                 type: number
 *     responses:
 *       201:
 *         description: Peça criada com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 */
router.post('/pecas', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { nome, descricao, tipo, preco } = req.body;

        if (!nome || !descricao || !tipo || preco == null) {
            return res.status(400).json({ error: 'nome, descricao, tipo e preco são obrigatórios' });
        }

        const controller = await getPecaController();
        const peca = await controller.createPeca({ nome, descricao, tipo, preco });
        return res.status(201).json(peca);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/pecas/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza uma peça
 *     tags: [Peças]
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
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               tipo:
 *                 type: string
 *                 enum: [PECA, INSUMO]
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Peça atualizada com sucesso
 *       404:
 *         description: Peça não encontrada
 *       400:
 *         description: ID obrigatório
 */
router.put('/pecas/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID da peça é obrigatório' });
        }

        const { nome, descricao, tipo, preco } = req.body;
        const controller = await getPecaController();
        const peca = await controller.updatePeca(id, { nome, descricao, tipo, preco });

        if (!peca) {
            return res.status(404).json({ error: 'Peca not found' });
        }

        return res.json(peca);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/pecas/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Deleta uma peça
 *     tags: [Peças]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Peça deletada com sucesso
 *       404:
 *         description: Peça não encontrada
 *       400:
 *         description: ID obrigatório
 */
router.delete('/pecas/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID da peça é obrigatório' });
        }

        const controller = await getPecaController();
        const deleted = await controller.deletePeca(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Peca not found' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
