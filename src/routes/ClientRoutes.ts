import {Router, Request, Response} from 'express';
import {ClientController} from '../controllers/ClientController';
import {ClientService} from '../services/ClientService';
import {ClientRepository} from '../Repository/ClientRepository';

const router = Router();

//Di manual
const clientRepo = new ClientRepository();
const clientService = new ClientService(clientRepo);
const clientController = new ClientController(clientService);

router.get("/clients", async (req: Request, res: Response) => {
    try {
        const clients = await clientController.getAllClients();
        return res.json(clients);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/clients/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const client = await clientController.getClientById(id);

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        return res.json(client);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/clients", async (req: Request, res: Response) => {
    try {
        const { Name, Email, Cpf, Phone } = req.body;
        if (!Name || !Email || !Cpf || !Phone) 
            return res.status(400).json({ error: "Name, Email, Phone, and Cpf are required" });
         
        const client = await clientController.createClient({ Name, Email, Cpf, Phone});
        return res.status(201).json(client);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

router.put("/clients/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const updates = req.body;
        const client = await clientController.updateClient(id, updates);

        if (!client) {
            return res.status(404).json({ error: "Client not found" });
        }

        return res.json(client);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/clients/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const deleted = await clientController.deleteClient(id);

        if (!deleted) {
            return res.status(404).json({ error: "Client not found" });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;