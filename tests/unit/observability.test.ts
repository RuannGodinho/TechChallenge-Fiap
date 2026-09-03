import { logger } from '../../src/infrastructure/logging/logger';
import { PinoObservabilityAdapter } from '../../src/infrastructure/logging/pino-observability.adapter';
import { getRequestContext, runWithRequestContext } from '../../src/infrastructure/logging/request-context';
import { BusinessEvent, BusinessReason } from '../../src/application/observability/business-events';
import { OrdemServicoMapper } from '../../src/Adapters/gateways/mappers/ordem-servico.mapper';
import { OrdemServico } from '../../src/enterprise/entities/ordem-servico.entity';
import { ObjectId } from 'mongodb';

describe('request context', () => {
    test('deve expor requestId apenas dentro do ALS', () => {
        expect(getRequestContext()).toEqual({});

        const seen = runWithRequestContext({ requestId: 'req-1' }, () => getRequestContext());

        expect(seen).toEqual({ requestId: 'req-1' });
        expect(getRequestContext()).toEqual({});
    });
});

describe('PinoObservabilityAdapter', () => {
    test('deve emitir evento de negócio no nível info', () => {
        const info = jest.spyOn(logger, 'info').mockImplementation(() => undefined);
        const adapter = new PinoObservabilityAdapter();

        adapter.emit({
            msg: BusinessEvent.osCreated,
            ordemServicoId: 'os-1',
            status: 'RECEBIDA',
        });

        expect(info).toHaveBeenCalledWith(
            expect.objectContaining({
                event: 'business',
                msg: BusinessEvent.osCreated,
                ordemServicoId: 'os-1',
            })
        );
        info.mockRestore();
    });

    test('deve emitir falha de processamento como error', () => {
        const error = jest.spyOn(logger, 'error').mockImplementation(() => undefined);
        const adapter = new PinoObservabilityAdapter();

        adapter.emit({
            msg: BusinessEvent.osProcessingFailed,
            alert: true,
            reason: BusinessReason.illegalTransition,
        });

        expect(error).toHaveBeenCalledWith(
            expect.objectContaining({
                event: 'business',
                msg: BusinessEvent.osProcessingFailed,
                alert: true,
            })
        );
        error.mockRestore();
    });
});

describe('OrdemServicoMapper statusEnteredAt', () => {
    test('deve persistir e restaurar statusEnteredAt', () => {
        const veiculoId = new ObjectId().toString();
        const ordem = OrdemServico.create({ cpfCnpj: '11144477735', veiculoId });
        const persistence = OrdemServicoMapper.toPersistence(ordem);

        expect(persistence.statusEnteredAt).toEqual(ordem.statusEnteredAt);

        const restored = OrdemServicoMapper.toDomain({
            ...persistence,
            _id: new ObjectId(),
        });

        expect(restored.statusEnteredAt).toEqual(ordem.statusEnteredAt);
    });
});
