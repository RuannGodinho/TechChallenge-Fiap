import { IObservabilityPort } from '../../application/ports/observability.port';
import { BusinessLogEvent } from '../../application/observability/business-events';
import { logger } from './logger';

const ERROR_MESSAGES = new Set(['smtp_send_failed', 'integration_failed', 'os_processing_failed']);

export class PinoObservabilityAdapter implements IObservabilityPort {
    emit(event: BusinessLogEvent): void {
        const payload = { event: 'business' as const, ...event };
        const level = resolveLevel(event);

        if (level === 'error') {
            logger.error(payload);
            return;
        }
        if (level === 'warn') {
            logger.warn(payload);
            return;
        }
        logger.info(payload);
    }
}

function resolveLevel(event: BusinessLogEvent): 'info' | 'warn' | 'error' {
    if (event.level) {
        return event.level;
    }
    if (event.alert || ERROR_MESSAGES.has(String(event.msg))) {
        return 'error';
    }
    if (event.msg === 'os_create_rejected') {
        return 'warn';
    }
    return 'info';
}
