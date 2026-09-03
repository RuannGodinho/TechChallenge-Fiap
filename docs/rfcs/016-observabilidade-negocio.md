# RFC – Observabilidade de regras de negócio via logs e New Relic

| Campo | Valor |
|---|---|
| **Número** | 016 |
| **Data** | 02/09/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-016](../adrs/016-observabilidade-negocio.md) |

## Resumo

Instrumentar os fluxos de OS, orçamento e execução com logs JSON de domínio (`event = business`), correlacionados por `requestId` e `trace.id`. Dashboards e alertas ficam no New Relic, consultando esses eventos via NRQL. Não há novo endpoint de métricas.

## Problema

A observabilidade implantada (HPA, probes, APM, `http_request`, Mongo/SMTP) cobre infra. Nas regras de negócio só existia o log de prova `clientes_list_test`. Sem `os_created` não há volume diário de OS. Sem timestamp de entrada em cada status não há tempo médio em Diagnóstico, Execução e Finalização. Falhas de transição, estoque, orçamento e SMTP não disparam alerta de processamento.

A [RFC-012](012-hpa-observabilidade.md) descartou New Relic no recorte de autoscaling. O CD já implanta o bundle (APM + Fluent Bit). Faltava o contrato de eventos de negócio.

## Proposta técnica

- Porta `IObservabilityPort.emit` nos use cases; adapter Pino no composition root.
- `AsyncLocalStorage` no middleware de request: todo log herda `requestId`. O mixin do Pino junta isso ao `getLinkingMetadata()` do agente (trace.id).
- Campo `statusEnteredAt` na OS. `transicionarStatus` calcula `durationMs` e o use case emite `os_status_changed`.
- Catálogo estável de `msg` (`os_created`, `os_status_changed`, `os_processing_failed`, …) para NRQL.
- Dashboards e alertas documentados em [NRQL.md](../observabilidade/NRQL.md). Criação na UI do New Relic; sem IaC de dashboard.

## Impacto esperado

**Ganhos**

- Volume diário, tempo médio por status e falhas de integração consultáveis no New Relic.
- Correlação pedido ↔ negócio sem mudar assinaturas dos use cases.
- Alertas de processamento de OS independentes do status HTTP (hoje a rota de OS devolve 500 para regra de negócio).

**Riscos e restrições**

- OS antigas sem `statusEnteredAt` usam `dataAbertura` na primeira transição.
- `GET /api/metricas/tempo-medio-servicos` continua medindo só a execução do serviço.
- Sem custom events: se o Fluent Bit parar, os dashboards de negócio somem.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| Novo `GET /api/metricas/tempo-medio-status` | O enunciado pede dashboard, não outro endpoint. |
| `recordCustomEvent` no agente | Duplica a fonte; logs já entram pelo Fluent Bit. |
| Histórico completo de status no Mongo | `statusEnteredAt` basta para `durationMs` na transição. |
| Prometheus/Grafana | Já rejeitado na RFC-012; New Relic está no cluster. |

## Pontos em aberto

- Mapear rejeições de regra de OS para HTTP 400, para o alerta de 5xx ficar só com falha inesperada.
- Importar o dashboard via NerdGraph quando houver account id no laboratório.
