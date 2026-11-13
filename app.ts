import executionOrderRoutes from './src/infrastructure/http/execution-order-routes';
import express from 'express';
import clienteRoutes from './src/infrastructure/http/cliente-routes';
import veiculoRoutes from './src/infrastructure/http/veiculo-routes';
import authRoutes from './src/infrastructure/http/auth-routes';
import ordemServicoRoutes from './src/infrastructure/http/ordem-servico-routes';
import healthRoutes from './src/infrastructure/http/health-routes';
import { normalizeBodyCase } from './src/infrastructure/http/middlewares/normalize-body-case';
import { requestLogging } from './src/infrastructure/http/middlewares/request-logging';

const app = express();

app.use(express.json());
app.use(healthRoutes);
app.use(requestLogging);
app.use(normalizeBodyCase);

app.use('/internal', executionOrderRoutes);
app.use('/api', clienteRoutes);
app.use('/api', veiculoRoutes);
app.use('/api', authRoutes);
app.use('/api', ordemServicoRoutes);

export default app;
