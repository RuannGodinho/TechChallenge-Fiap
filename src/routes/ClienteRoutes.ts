import { Router, Request, Response } from 'express';
import { ClienteController } from '../controllers/ClienteController';
import { ClienteService } from '../services/ClienteService';
import { ClienteRepository } from '../Repository/ClienteRepository';

const router = Router();

const clienteRepo = new ClienteRepository();
const clienteService = new ClienteService(clienteRepo);
const clienteController = new ClienteController(clienteService);

router.get("/clientes", async (req: Request, res: Response) => {
    try {
        const clientes = await clienteController.getAllClientes();
        return res.json(clientes);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/clientes/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do cliente é obrigatório" });

        const cliente = await clienteController.getClienteById(id);

        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        return res.json(cliente);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/clientes", async (req: Request, res: Response) => {
    try {
        const { Nome, Email, Cpf, Telefone } = req.body;
        if (!Nome || !Email || !Cpf || !Telefone)
            return res.status(400).json({ error: "Nome, Email, Cpf e Telefone são obrigatórios" });

        const cliente = await clienteController.criarCliente({ Nome, Email, Cpf, Telefone });
        return res.status(201).json(cliente);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

router.put("/clientes/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do cliente é obrigatório" });

        const updates = req.body;
        const cliente = await clienteController.atualizarCliente(id, updates);

        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        return res.json(cliente);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete("/clientes/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        if (id === ':id')
            return res.status(400).json({ error: "ID do cliente é obrigatório" });

        const deleted = await clienteController.deletarCliente(id);

        if (!deleted) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;