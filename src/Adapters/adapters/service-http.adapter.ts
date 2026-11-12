import { DownstreamServiceError } from '../../application/errors/downstream-service.error';
import { getRequestContext } from '../../infrastructure/logging/request-context';
import { IExecucaoServicoPort } from '../../application/ports/execucao-servico.port';
import { IOrcamentoPort, CriarOrcamentoPendenteInput } from '../../application/ports/orcamento.port';
import { IPecaLookupPort, PecaLookupData } from '../../application/ports/peca-lookup.port';
import { IServicoLookupPort, ServicoLookupData } from '../../application/ports/servico-lookup.port';
import { IEstoqueMovimentacaoPort } from '../../application/ports/estoque-movimentacao.port';

/** Provisional internal contracts; no other service database is accessed here. */
export class ServiceHttpClient {
    constructor(private readonly baseUrl: string | undefined, private readonly service: string, private readonly apiKey?: string) {}

    async request<T>(path: string, method = 'GET', body?: unknown, allowNotFound = false): Promise<T> {
        if (!this.baseUrl) throw new DownstreamServiceError(this.service, `${this.service} URL is not configured`);
        const { requestId } = getRequestContext();
        let response: Response;
        try {
            response = await fetch(new URL(path, this.baseUrl), {
                method,
                headers: { 'content-type': 'application/json', ...(requestId ? { 'x-request-id': requestId } : {}), ...(this.apiKey ? { 'x-internal-api-key': this.apiKey } : {}) },
                body: body === undefined ? undefined : JSON.stringify(body),
                signal: AbortSignal.timeout(5000),
            });
        } catch {
            throw new DownstreamServiceError(this.service, `${this.service} is unavailable`);
        }
        if (allowNotFound && response.status === 404) return null as T;
        if (!response.ok) throw new DownstreamServiceError(this.service, `${this.service} request failed (${response.status})`);
        if (response.status === 204 || method !== 'GET') return undefined as T;
        try {
            return await response.json() as T;
        } catch {
            throw new DownstreamServiceError(this.service, `${this.service} returned invalid JSON`);
        }
    }
}

export class ExecutionHttpAdapter implements IExecucaoServicoPort, IEstoqueMovimentacaoPort {
    constructor(private readonly client: ServiceHttpClient) {}
    async createExecucoesParaServicos(ordemServicoId: string, servicoIds: string[]): Promise<void> {
        await this.client.request('/internal/executions', 'POST', { ordemServicoId, servicoIds });
    }
    async assertQuantidadeDisponivel(pecaId: string, quantidade: number): Promise<void> {
        await this.client.request('/internal/inventory/check', 'POST', { pecaId, quantidade });
    }
    async registrarSaidaOS(pecaId: string, quantidade: number): Promise<void> {
        await this.client.request('/internal/inventory/consume', 'POST', { pecaId, quantidade });
    }
}
export class PecaHttpAdapter implements IPecaLookupPort {
    constructor(private readonly client: ServiceHttpClient) {}
    findById(id: string): Promise<PecaLookupData | null> {
        return this.client.request(`/internal/parts/${encodeURIComponent(id)}`, 'GET', undefined, true);
    }
}
export class ServicoHttpAdapter implements IServicoLookupPort {
    constructor(private readonly client: ServiceHttpClient) {}
    findById(id: string): Promise<ServicoLookupData | null> {
        return this.client.request(`/internal/services/${encodeURIComponent(id)}`, 'GET', undefined, true);
    }
}
export class BillingHttpAdapter implements IOrcamentoPort {
    constructor(private readonly client: ServiceHttpClient) {}
    async createPendente(input: CriarOrcamentoPendenteInput): Promise<void> {
        await this.client.request('/internal/estimates', 'POST', { ...input });
    }
    async isPaymentConfirmed(ordemServicoId: string): Promise<boolean> {
        const result = await this.client.request<{ paid: boolean }>(`/internal/orders/${encodeURIComponent(ordemServicoId)}/payment-status`);
        if (typeof result?.paid !== 'boolean') throw new DownstreamServiceError('Billing', 'Billing returned an invalid payment response');
        return result.paid;
    }
    async isLatestOrcamentoApproved(ordemServicoId: string): Promise<boolean> {
        const result = await this.client.request<{ approved: boolean }>(`/internal/orders/${encodeURIComponent(ordemServicoId)}/estimate-approval`);
        if (typeof result?.approved !== 'boolean') throw new DownstreamServiceError('Billing', 'Billing returned an invalid approval response');
        return result.approved;
    }
}
