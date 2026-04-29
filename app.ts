import express from "express";
import clienteRoutes from "./src/routes/ClienteRoutes";
import veiculoRoutes from "./src/routes/VeiculoRoutes";
import servicoRoutes from "./src/routes/ServicoRoutes";

const app = express();

app.use(express.json());

app.use("/api", clienteRoutes);
app.use("/api", veiculoRoutes);
app.use("/api", servicoRoutes);

export default app;