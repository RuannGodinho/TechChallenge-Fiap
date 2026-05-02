import express from 'express';
import clienteRoutes from './src/routes/ClienteRoutes';
import veiculoRoutes from './src/routes/VeiculoRoutes';
import servicoRoutes from './src/routes/ServicoRoutes';
import pecaRoutes from './src/routes/PecaRoutes';
import estoqueRoutes from './src/routes/EstoqueRoutes';
import authRoutes from './src/routes/AuthRoutes';
import ordemServicoRoutes from './src/routes/OrdemServicoRoutes';

const app = express();

app.use(express.json());

app.use('/api', clienteRoutes);
app.use('/api', veiculoRoutes);
app.use('/api', servicoRoutes);
app.use('/api', pecaRoutes);
app.use('/api', estoqueRoutes);
app.use('/api', authRoutes);
app.use('/api', ordemServicoRoutes);

export default app;
