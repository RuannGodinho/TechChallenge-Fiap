# ADR – Observamos as regras de OS com logs estruturados no New Relic

| Campo | Valor |
|---|---|
| **Número** | 016 |
| **Data** | 02/09/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-016](../rfcs/016-observabilidade-negocio.md) |

## Contexto

A [ADR-012](012-hpa-observabilidade.md) definiu o mínimo de laboratório para autoscaling (HPA + metrics-server + CloudWatch das Lambdas) e descartou New Relic naquele recorte. O CD passou a implantar APM e Fluent Bit. O enunciado pede logs de domínio, correlação de requisição, dashboards de volume/tempo por status/erros de integração e alertas de falha no processamento de OS. Quase nenhum use case emitia log.

## Decisão

Emitimos eventos de negócio em JSON (`event = business`) pela porta `IObservabilityPort`. O Pino recebe `requestId` via AsyncLocalStorage e `trace.id` do agente. Persistimos `statusEnteredAt` na OS só para calcular `durationMs` na transição. Dashboards e alertas são NRQL no New Relic, documentados em [NRQL.md](../observabilidade/NRQL.md). Não criamos endpoint novo de métricas nem custom events.

Esta ADR **não substitui** a 012: HPA e CloudWatch de auth permanecem. A 016 cobre observabilidade de **negócio**.

## Consequências

Volume diário (`os_created`), tempo médio por status (`os_status_changed.durationMs`) e falhas (`os_processing_failed`, `smtp_send_failed`, `integration_failed`) ficam consultáveis. Use cases de OS/orçamento/execução passam a depender da porta de observabilidade. Documentos antigos sem `statusEnteredAt` caem em `dataAbertura`. Rejeição de regra na rota de OS continua 500; o alerta de domínio usa o evento, não o status HTTP.

## Alternativas

Descartamos endpoint de tempo médio por status, custom events do APM, histórico completo de status no Mongo e Prometheus/Grafana. Descartamos reescrever a ADR-012: o recorte de HPA segue válido.
