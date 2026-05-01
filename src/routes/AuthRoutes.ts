import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';
import { authMiddleware } from '../middleware/AuthMiddleware';

const router = Router();
const authController = new AuthController(new AuthService());

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const result = await authController.login(email, password);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  return res.status(200).json({ token: result.token });
});

// rota protegida de teste
router.get('/me', authMiddleware, (req, res) => {
  return res.json({ user: (req as any).user });
});

export default router;