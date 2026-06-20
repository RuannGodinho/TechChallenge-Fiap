import app from '../../app';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { DIContainer } from '../infrastructure/composition-root/di-container';

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (_req, res) => {
    res.json(swaggerSpec);
});

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap() {
    await DIContainer.getInstance().initialize();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server rodando na porta ${PORT}`);
        console.log(`Swagger em http://localhost:${PORT}/docs`);
    });
}

bootstrap().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
