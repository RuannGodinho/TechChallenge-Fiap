import { Router, Request, Response } from 'express';
import { ServicoController } from '../controllers/ServicoController';
import { ServicoService } from '../services/ServicoService';
import { ServicoRepository } from '../Repository/ServicoRepository';

const router = Router();

const servicoRepo = new ServicoRepository();
const servicoService = new ServicoService(servicoRepo);
const servicoController = new ServicoController(servicoService);

router.get("/servicos", async (req: Request, res: Response) => {
    try {
        const servicos = await servicoController.getAllServicos();
        return res.json(servicos);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/servicos/:id", async (req: Request, res: Response) => {
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

router.post("/servicos", async (req: Request, res: Response) => {
    try {
        const { Nome, Descricao, Preco } = req.body;
        if (!Nome || !Descricao || Preco == null)
            return res.status(400).json({ error: "Nome, Descricao, and Preco are required" });

        const service = await servicoController.createServico({ Nome, Descricao, Preco });
        return res.status(201).json(service);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

router.put("/servicos/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do serviço é obrigatório" });

        const { Nome, Descricao, Preco } = req.body;

        const service = await servicoController.updateServico(id, { Nome, Descricao, Preco });

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        return res.json(service);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

router.delete("/servicos/:id", async (req: Request, res: Response) => {
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