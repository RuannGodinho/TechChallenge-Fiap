describe('gateway-trust config', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    test('requires GATEWAY_TRUST_SECRET when AUTH_MODE is gateway', () => {
        process.env.AUTH_MODE = 'gateway';
        delete process.env.GATEWAY_TRUST_SECRET;

        expect(() => require('../../src/config/gateway-trust')).toThrow(
            'GATEWAY_TRUST_SECRET must be set when AUTH_MODE=gateway',
        );
    });

    test('accepts gateway mode when trust secret is configured', () => {
        process.env.AUTH_MODE = 'gateway';
        process.env.GATEWAY_TRUST_SECRET = 'configured-trust-secret';

        const { isValidGatewayTrustHeader } = require('../../src/config/gateway-trust');

        expect(isValidGatewayTrustHeader('configured-trust-secret')).toBe(true);
        expect(isValidGatewayTrustHeader('wrong-secret')).toBe(false);
    });
});
