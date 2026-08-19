import { Request, Response, NextFunction } from 'express';
import { gatewayUserMiddleware } from '../../src/infrastructure/http/middlewares/gateway-user-middleware';

describe('gatewayUserMiddleware', () => {
    test('populates req.user from gateway headers', () => {
        const req = {
            headers: {
                'x-user-id': 'mock-user',
                'x-user-email': 'admin@example.com',
            },
        } as unknown as Request;

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        const next = jest.fn() as NextFunction;

        gatewayUserMiddleware(req, res, next);

        expect((req as Request & { user: { userId: string; email: string } }).user).toEqual({
            userId: 'mock-user',
            email: 'admin@example.com',
        });
        expect(next).toHaveBeenCalled();
    });

    test('returns 401 when gateway headers are missing', () => {
        const req = { headers: {} } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;
        const next = jest.fn() as NextFunction;

        gatewayUserMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token não informado' });
        expect(next).not.toHaveBeenCalled();
    });
});
