import app from "../../app";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swagger";

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
  console.log(`📘 Swagger em http://localhost:${PORT}/docs`);
});