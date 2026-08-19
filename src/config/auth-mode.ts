export type AuthMode = 'local' | 'gateway';

export const authMode = (process.env.AUTH_MODE || 'local') as AuthMode;

export const isGatewayAuthMode = authMode === 'gateway';
