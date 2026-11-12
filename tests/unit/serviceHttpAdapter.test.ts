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
