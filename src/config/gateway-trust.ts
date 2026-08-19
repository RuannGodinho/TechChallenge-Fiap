import crypto from 'crypto';
import { isGatewayAuthMode } from './auth-mode';

const GATEWAY_TRUST_HEADER = 'x-gateway-trust';

if (isGatewayAuthMode && !process.env.GATEWAY_TRUST_SECRET?.trim()) {
    throw new Error('GATEWAY_TRUST_SECRET must be set when AUTH_MODE=gateway');
}

export function isValidGatewayTrustHeader(headerValue: string | string[] | undefined): boolean {
    const secret = process.env.GATEWAY_TRUST_SECRET;

    if (!secret || !headerValue || Array.isArray(headerValue)) {
        return false;
    }

    const provided = Buffer.from(String(headerValue));
    const expected = Buffer.from(secret);

    if (provided.length !== expected.length) {
        return false;
    }

    return crypto.timingSafeEqual(provided, expected);
}

export { GATEWAY_TRUST_HEADER };
