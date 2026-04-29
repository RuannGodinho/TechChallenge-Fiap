// src/main/server.ts

import express from "express";
import clienteRoutes from "../routes/ClienteRoutes";
import veiculoRoutes from "../routes/VeiculoRoutes";
import servicoRoutes from "../routes/ServicoRoutes";

const app = express();

app.use(express.json());

// rotas
app.use("/api", clienteRoutes);
app.use("/api", veiculoRoutes);
app.use("/api", servicoRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});