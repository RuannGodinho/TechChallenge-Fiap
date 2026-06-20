import { Router, Request, Response } from 'express';
import { authMiddleware } from './middlewares/auth-middleware';
import { DIContainer } from '../composition-root/di-container';

const router = Router();

async function getClienteController() {
    const container = DIContainer.getInstance();
    await container.ensureInitialized();
    return container.getClienteController();
}

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista clientes
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso
 */
router.get('/clientes', authMiddleware, async (_req: Request, res: Response) => {
    try {
        const controller = await getClienteController();
        const clientes = await controller.getAllClientes();
        return res.json(clientes);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/clientes/cpf/{cpf}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Busca cliente por CPF
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: cpf
 *         required: true
 *         schema:
 *           type: string
 *         description: CPF ou CNPJ do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: CPF obrigatório
 */
router.get('/clientes/cpf/:cpf', authMiddleware, async (req: Request, res: Response) => {
    try {
        const cpf = req.params.cpf as string;

        if (!cpf) {
            return res.status(400).json({ error: 'CPF/CNPJ do cliente é obrigatório' });
        }

        const controller = await getClienteController();
        const cliente = await controller.getClienteByCpf(cpf);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        return res.json(cliente);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Busca cliente por ID
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.get('/clientes/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do cliente é obrigatório' });
        }

        const controller = await getClienteController();
        const cliente = await controller.getClienteById(id);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        return res.json(cliente);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria um novo cliente
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - cpf
 *               - telefone
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *                 description: CPF ou CNPJ do cliente
 *               telefone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *       400:
 *         description: Campos obrigatórios não fornecidos
 */
router.post('/clientes', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { nome, email, cpf, telefone } = req.body;

        if (!nome || !email || !cpf || !telefone) {
            return res.status(400).json({
                error: 'nome, email, cpf/cnpj e telefone são obrigatórios',
            });
        }

        const controller = await getClienteController();
        const responseDto = await controller.criarCliente({ nome, email, cpf, telefone });
        return res.status(201).json(responseDto);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     summary: Atualiza um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               cpf:
 *                 type: string
 *               telefone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.put('/clientes/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do cliente é obrigatório' });
        }

        const controller = await getClienteController();
        const cliente = await controller.atualizarCliente(id, req.body);

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        return res.json(cliente);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        return res.status(500).json({ error: message });
    }
});

/**
 * @swagger
 * /api/clientes/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     summary: Deleta um cliente
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       204:
 *         description: Cliente deletado com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       400:
 *         description: ID obrigatório
 */
router.delete('/clientes/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id') {
            return res.status(400).json({ error: 'ID do cliente é obrigatório' });
        }

        const controller = await getClienteController();
        const deleted = await controller.deletarCliente(id);

        if (!deleted) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
