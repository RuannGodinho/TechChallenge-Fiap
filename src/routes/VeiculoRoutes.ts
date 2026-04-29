import { Router, Request, Response } from 'express';
import { VeiculoController } from '../controllers/VeiculoController';
import { VeiculoService } from '../services/VeiculoService';
import { VeiculoRepository } from '../Repository/VeiculoRepository';

const router = Router();

const VeiculoRepo = new VeiculoRepository();
const veiculoService = new VeiculoService(VeiculoRepo);
const veiculoController = new VeiculoController(veiculoService);

router.get("/veiculos", async (req: Request, res: Response) => {
    try {
        const Veiculos = await veiculoController.getAllVeiculos();
        return res.json(Veiculos);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/veiculos/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const Veiculo = await veiculoController.getVeiculoById(id);

        if (!Veiculo) {
            return res.status(404).json({ error: "Veiculo not found" });
        }

        return res.json(Veiculo);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/veiculos", async (req: Request, res: Response) => {
    try {
        const { Placa, Modelo, Ano, Marca } = req.body;
        if (!Placa || !Modelo || !Ano || !Marca)
            return res.status(400).json({ error: "Placa, Modelo, Ano, and Marca are required" });

        const Veiculo = await veiculoController.criarVeiculo({ Placa, Modelo, Ano, Marca });
        return res.status(201).json(Veiculo);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

router.put("/veiculos/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const { Placa, Modelo, Ano, Marca } = req.body;

        const Veiculo = await veiculoController.atualizarVeiculo(id, { Placa, Modelo, Ano, Marca });

        if (!Veiculo) {
            return res.status(404).json({ error: "Veiculo not found" });
        }

        return res.json(Veiculo);
    } catch (error: any) {
        return res.status(500).json({ error: "Internal server error " + error.message });
    }
});

router.delete("/veiculos/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const deleted = await veiculoController.deletarVeiculo(id);

        if (!deleted) {
            return res.status(404).json({ error: "Veiculo not found" });
        }

        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;