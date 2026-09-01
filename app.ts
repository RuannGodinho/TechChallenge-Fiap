import express from 'express';
import clienteRoutes from './src/infrastructure/http/cliente-routes';
import veiculoRoutes from './src/infrastructure/http/veiculo-routes';
import servicoRoutes from './src/infrastructure/http/servico-routes';
import pecaRoutes from './src/infrastructure/http/peca-routes';
import estoqueRoutes from './src/infrastructure/http/estoque-routes';
import authRoutes from './src/infrastructure/http/auth-routes';
import ordemServicoRoutes from './src/infrastructure/http/ordem-servico-routes';
import orcamentoRoutes from './src/infrastructure/http/orcamento-routes';
import execucaoServicoRoutes from './src/infrastructure/http/execucao-servico-routes';
import healthRoutes from './src/infrastructure/http/health-routes';
import { normalizeBodyCase } from './src/infrastructure/http/middlewares/normalize-body-case';

const app = express();

app.use(express.json());
app.use(healthRoutes);
app.use(normalizeBodyCase);

app.use('/api', clienteRoutes);
app.use('/api', veiculoRoutes);
app.use('/api', servicoRoutes);
app.use('/api', pecaRoutes);
app.use('/api', estoqueRoutes);
app.use('/api', authRoutes);
app.use('/api', ordemServicoRoutes);
app.use('/api', orcamentoRoutes);
app.use('/api', execucaoServicoRoutes);

export default app;
