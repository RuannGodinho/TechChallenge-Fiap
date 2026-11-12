# Service Orders extraction

Service Orders owns customers, vehicles, orders, status history, and the customer lookup used by authentication. Its MongoDB connection is `MONGODB_URI`. The seed writes only those collections.

## API changes

- Order responses include `statusHistory` (status and entry time); for legacy records without history, the current status and entry time are returned.
- Customer, vehicle, and authentication lookup routes remain in this service. The former catalog, inventory, execution, and estimate routes are no longer mounted; the gateway must route them to their owners.

## Provisional internal HTTP contracts

Set `EXECUTION_SERVICE_URL` and `BILLING_SERVICE_URL` to service base URLs. Set `BILLING_INTERNAL_API_KEY` to the same secret as Billing’s `INTERNAL_API_KEY`. Each call uses a five-second timeout and forwards the incoming `x-request-id` when available. Non-2xx responses, connection failures, timeouts, and invalid JSON fail the order operation with HTTP 502. Catalog 404 responses mean the item was not found. These contracts must be implemented and agreed by the other services; they are not claims that those services already exist.

| Owner | Method and path | Request / response |
| --- | --- | --- |
| Execution | `GET /internal/parts/:id` | JSON `{id,nome,descricao,preco,tipo}`, or 404 |
| Execution | `GET /internal/services/:id` | JSON `{id,nome,descricao,preco}`, or 404 |
| Execution | `POST /internal/executions` | `{ordemServicoId,servicoIds}` |
| Execution | `POST /internal/inventory/check` | `{pecaId,quantidade}`; non-2xx if unavailable |
| Execution | `POST /internal/inventory/consume` | `{pecaId,quantidade}` |
| Billing | `POST /internal/estimates` | `{ordemServicoId,valorTotal,pecas,servicos}` |
| Billing | `GET /internal/orders/:id/estimate-approval` | `{approved: boolean}` |

Successful commands may return any 2xx response; their bodies are ignored. Successful GET requests must return JSON. Estimate `pecas` entries contain `id`, `nome`, `descricao`, `preco`, `tipo`, and `quantidade`; `servicos` entries contain `id`, `nome`, `descricao`, and `preco`. If order creation saves the order but the execution call fails, its 502 response contains `orderId`: the caller should reconcile that existing order before retrying creation. Service-to-service authentication, idempotency keys, retry and reconciliation contracts are not yet implemented. The current synchronous flow can persist an order before an execution request fails, or partially consume stock before a later operation fails. Do not rely on it for recoverable production workflows: the planned saga, outbox, reservations and compensation remain necessary. Payment gating is also a later milestone.

## Local checks

Copy `.env.example` to `.env`, configure the service URLs and secrets, then run `npm ci`, `npm run typecheck`, and `npm test`. `docker compose up -d --build` starts this service and its MongoDB only; Billing and Execution must be started separately for operations that call them. The OpenAPI document at `/swagger.json` covers the routes mounted by this service.

## Delivery payment check

Before moving an order from `FINALIZADA` to `ENTREGUE`, Service Orders calls Billing `GET /internal/orders/:id/payment-status`. Delivery is rejected when the result is unpaid or Billing cannot be reached. Billing rechecks the payment with Mercado Pago. Execution completion still needs a reliable producer to call Billing's authenticated execution-completion endpoint; until that integration exists, checkout cannot proceed through the intended workflow.

## Billing events consumer

Set `RABBITMQ_URL` to the broker shared with Billing and run `npm run billing-consumer` alongside the API. The Compose service is available under the `messaging` profile (`docker compose --profile messaging up`); its URL must be reachable from the container, not `localhost`. The Kubernetes deployment expects the URL in `api-secrets`. The worker consumes the durable `service-orders.billing` queue, accepts version 1 estimate and payment events, and atomically records them in each order's `billingEvents` array using message ID deduplication. Malformed events or messages that fail three attempts go to `service-orders.billing.dlq` for operator inspection and replay. Acknowledgement follows the database write. Delivery still uses the live Billing payment check; this consumer records events but does not yet implement saga transitions or execution completion. Billing messages must come from a trusted broker with restricted credentials.
