import { BillingHttpAdapter, ExecutionHttpAdapter, ServiceHttpClient } from '../../src/Adapters/adapters/service-http.adapter';

describe('downstream HTTP adapters', () => {
    afterEach(() => jest.restoreAllMocks());
    test('sends execution requests', async () => {
        const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, status: 204 } as Response);
        const adapter = new ExecutionHttpAdapter(new ServiceHttpClient('http://execution:3000', 'Execution'));
        await adapter.createExecucoesParaServicos('order-1', ['service-1']);
        const [url, options] = fetchMock.mock.calls[0];
        expect(String(url)).toBe('http://execution:3000/internal/executions');
        expect(JSON.parse(String(options?.body))).toEqual({ ordemServicoId: 'order-1', servicoIds: ['service-1'] });
    });
    test('rejects downstream errors and invalid billing approval', async () => {
        const fetchMock = jest.spyOn(globalThis, 'fetch');
        const adapter = new BillingHttpAdapter(new ServiceHttpClient('http://billing:3000', 'Billing'));
        fetchMock.mockResolvedValueOnce({ ok: false, status: 503 } as Response);
        await expect(adapter.isLatestOrcamentoApproved('order-1')).rejects.toThrow('503');
        fetchMock.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ approved: 'yes' }) } as Response);
        await expect(adapter.isLatestOrcamentoApproved('order-1')).rejects.toThrow('invalid approval');
    });
    test('fails before sending requests without a configured URL', async () => {
        const fetchMock = jest.spyOn(globalThis, 'fetch');
        const adapter = new ExecutionHttpAdapter(new ServiceHttpClient(undefined, 'Execution'));
        await expect(adapter.createExecucoesParaServicos('order-1', [])).rejects.toThrow('not configured');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('unused downstream response bodies', () => {
    afterEach(() => jest.restoreAllMocks());
    test.each([
        { status: 201, method: 'POST', allowNotFound: false, rejects: false },
        { status: 404, method: 'GET', allowNotFound: true, rejects: false },
        { status: 404, method: 'GET', allowNotFound: false, rejects: true },
        { status: 503, method: 'POST', allowNotFound: false, rejects: true },
    ])('releases a $status response for $method', async ({ status, method, allowNotFound, rejects }) => {
        const response = new Response('{"message":"ignored"}', { status });
        const cancel = jest.spyOn(response.body!, 'cancel');
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);
        const client = new ServiceHttpClient('http://service.test', 'test', 'internal-key');
        const request = client.request('/resource', method, undefined, allowNotFound);
        if (rejects) await expect(request).rejects.toThrow(String(status));
        else await expect(request).resolves.toBe(status === 404 ? null : undefined);
        expect(cancel).toHaveBeenCalledTimes(1);
    });
    test('keeps a successful GET body available for JSON parsing', async () => {
        const response = new Response('{"id":"part"}', { status: 200 });
        const cancel = jest.spyOn(response.body!, 'cancel');
        const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);
        await expect(new ServiceHttpClient('http://execution.test', 'Execution', 'internal-key').request('/api/pecas/part')).resolves.toEqual({ id: 'part' });
        expect(cancel).not.toHaveBeenCalled();
        expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ 'x-internal-api-key': 'internal-key' });
    });
    test('does not mask the HTTP error if body cancellation fails', async () => {
        const response = new Response('ignored', { status: 502 });
        jest.spyOn(response.body!, 'cancel').mockRejectedValue(new Error('already closed'));
        jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);
        await expect(new ServiceHttpClient('http://service.test', 'test').request('/resource')).rejects.toThrow('502');
    });
});
