// src/main/server.ts

import express from "express";
import clientRoutes from "../routes/ClientRoutes";

const app = express();

app.use(express.json());

// rotas
app.use("/api", clientRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});