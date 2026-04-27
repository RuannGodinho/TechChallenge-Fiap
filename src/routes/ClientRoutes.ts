import {Router, Request, Response} from 'express';
import {ClientController} from '../controllers/ClientController';
import {ClientService} from '../services/ClientService';
import {ClientRepository} from '../Repository/ClientRepository';

const router = Router();

//Di manual
const clientRepo = new ClientRepository();
const clientService = new ClientService(clientRepo);
const clientController = new ClientController(clientService);

router.get("/client/:id", async (req: Request, res: Response) =>{
    const id = req.params.id as string;
    const name = await clientController.getClientNameById(id);
    return res.json({ name });
});

export default router;