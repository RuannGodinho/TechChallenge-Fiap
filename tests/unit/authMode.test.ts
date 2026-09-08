describe('auth-mode', () => {
    const originalEnv = process.env;

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    test('defaults to local when AUTH_MODE is unset', () => {
        delete process.env.AUTH_MODE;

        const { authMode, isGatewayAuthMode } = require('../../src/config/auth-mode');

        expect(authMode).toBe('local');
        expect(isGatewayAuthMode).toBe(false);
    });

    test('accepts gateway mode', () => {
        process.env.AUTH_MODE = 'gateway';

        const { authMode, isGatewayAuthMode } = require('../../src/config/auth-mode');

        expect(authMode).toBe('gateway');
        expect(isGatewayAuthMode).toBe(true);
    });

    test('rejects unsupported AUTH_MODE values at startup', () => {
        process.env.AUTH_MODE = 'gatway';

        expect(() => require('../../src/config/auth-mode')).toThrow('Unsupported AUTH_MODE: gatway');
    });
});
