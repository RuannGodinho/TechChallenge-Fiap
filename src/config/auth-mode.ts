export type AuthMode = 'local' | 'gateway';

const configuredAuthMode = process.env.AUTH_MODE ?? 'local';

if (configuredAuthMode !== 'local' && configuredAuthMode !== 'gateway') {
    throw new Error(`Unsupported AUTH_MODE: ${configuredAuthMode}`);
}

export const authMode: AuthMode = configuredAuthMode;

export const isGatewayAuthMode = authMode === 'gateway';
