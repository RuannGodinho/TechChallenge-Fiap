import pino from 'pino';

function newRelicLinking(): Record<string, unknown> {
    try {
        // Presente só quando o APM auto-attach injeta o agente no pod.
        const newrelic = require('newrelic') as {
            getLinkingMetadata?: () => Record<string, unknown>;
        };
        return newrelic.getLinkingMetadata?.() ?? {};
    } catch {
        return {};
    }
}

const level =
    process.env.NODE_ENV === 'test'
        ? 'silent'
        : (process.env.LOG_LEVEL ?? 'info');

export const logger = pino({
    level,
    base: { service: 'api' },
    timestamp: pino.stdTimeFunctions.isoTime,
    mixin: newRelicLinking,
    redact: {
        paths: [
            'req.headers.authorization',
            'headers.authorization',
            'password',
            'pass',
            'token',
        ],
        remove: true,
    },
});
