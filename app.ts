import express from "express";
import clienteRoutes from "./src/routes/ClienteRoutes";
import veiculoRoutes from "./src/routes/VeiculoRoutes";
import servicoRoutes from "./src/routes/ServicoRoutes";
import pecaRoutes from "./src/routes/PecaRoutes";
import estoqueRoutes from "./src/routes/EstoqueRoutes";

const app = express();

app.use(express.json());

app.use("/api", clienteRoutes);
app.use("/api", veiculoRoutes);
app.use("/api", servicoRoutes);
app.use("/api", pecaRoutes);
app.use("/api", estoqueRoutes);

export default app;