import { Router, Request, Response } from 'express';
import { DIContainer } from '../composition-root/di-container';
import { authMiddleware } from './middlewares/auth-middleware';
import { isGatewayAuthMode } from '../../config/auth-mode';
import { isValidGatewayTrustHeader } from '../../config/gateway-trust';

const router = Router();

function getAuthController() {
    return DIContainer.getInstance().getAuthController();
}

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Autentica o cliente pelo CPF e emite JWT
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cpf
 *             properties:
 *               cpf:
 *                 type: string
 *                 example: "81788455045"
 *     responses:
 *       200:
 *         description: Token JWT emitido
 *       400:
 *         description: CPF inválido ou ausente
 *       401:
 *         description: Cliente não encontrado
 *       403:
 *         description: Cliente inativo
 *       410:
 *         description: Login disponível apenas via API Gateway
 */
if (isGatewayAuthMode) {
    router.post('/login', (_req: Request, res: Response) => {
        return res.status(410).json({ error: 'Login disponível apenas via API Gateway' });
    });
} else {
    router.post('/login', async (req: Request, res: Response) => {
        const { cpf } = req.body;

        if (!cpf) {
            return res.status(400).json({ error: 'CPF é obrigatório' });
        }

        const controller = getAuthController();
        const result = await controller.login(String(cpf));

        if ('error' in result) {
            return res.status(result.statusCode).json({ error: result.error });
        }

        return res.status(200).json(result);
    });
}

/**
 * Lookup interno para a Lambda AuthSign (mesmo banco da API).
 * Protegido por x-gateway-trust — não é rota de cliente.
 */
router.get('/internal/auth/clientes/:cpf', async (req: Request, res: Response) => {
    if (!isValidGatewayTrustHeader(req.headers['x-gateway-trust'])) {
        return res.status(401).json({ error: 'Não autorizado' });
    }

    const cpf = req.params.cpf as string;
    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório' });
    }

    try {
        const cliente = await getAuthController().lookupByCpf(cpf);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        return res.status(200).json(cliente);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'CPF inválido';
        return res.status(400).json({ error: message });
    }
});

/**
 * @swagger
 * /api/me:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retorna o cliente autenticado
 *     tags: [Login]
 *     responses:
 *       200:
 *         description: Cliente autenticado
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    const controller = getAuthController();
    return res.json({ user: controller.toAuthenticatedUserResponse((req as any).user) });
});

export default router;
