import { Router, Request, Response } from 'express';
import { DIContainer } from '../composition-root/di-container';
import { authMiddleware } from './middlewares/auth-middleware';

const router = Router();

function getAuthController() {
    return DIContainer.getInstance().getAuthController();
}

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login
 *     tags: [Login]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario logado com sucesso
 */
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const controller = getAuthController();
    const result = await controller.login(email, password);

    if ('error' in result) {
        return res.status(401).json({ error: result.error });
    }

    return res.status(200).json(result);
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
    const controller = getAuthController();
    return res.json({ user: controller.toAuthenticatedUserResponse((req as any).user) });
});

export default router;
