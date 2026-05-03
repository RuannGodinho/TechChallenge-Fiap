import { Router, Request, Response } from 'express';
import { ServicoController } from '../controllers/servico-controller';
import { ServicoService } from '../services/servico-service';
import { ServicoRepository } from '../Repository/servico-repository';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();

const servicoRepo = new ServicoRepository();
const servicoService = new ServicoService(servicoRepo);
const servicoController = new ServicoController(servicoService);

router.get("/servicos", authMiddleware, async (req: Request, res: Response) => {
    try {
        const servicos = await servicoController.getAllServicos();
        return res.json(servicos);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

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