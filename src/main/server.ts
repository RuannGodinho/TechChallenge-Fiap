import app from '../../app';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { DIContainer } from '../infrastructure/composition-root/di-container';
import { logger } from '../infrastructure/logging/logger';

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/swagger.json', (_req, res) => {
    res.json(swaggerSpec);
});

const PORT = Number(process.env.PORT ?? 3000);

async function bootstrap() {
    await DIContainer.getInstance().initialize();

    app.listen(PORT, '0.0.0.0', () => {
        logger.info({ msg: 'server_started', port: PORT });
    });
}

bootstrap().catch((error) => {
    logger.fatal({ err: error, msg: 'server_start_failed' });
    process.exit(1);
});
