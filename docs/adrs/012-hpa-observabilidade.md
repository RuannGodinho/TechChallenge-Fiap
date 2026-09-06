# ADR – Escalamos por CPU e observamos o mínimo de laboratório

| Campo | Valor |
|---|---|
| **Número** | 012 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-012](../rfcs/012-hpa-observabilidade.md) |

## Contexto

Uma réplica fixa não demonstra escalabilidade. HPA exige métrica no cluster. Prometheus, Grafana e APM competem com prazo e com o tamanho do node. Precisamos provar réplica por CPU e rastro de login.

## Decisão

Escalamos `api-deployment` com **HPA** (1 a 4 réplicas, CPU média 60% do request `100m`) alimentado pelo **metrics-server**. Auditamos autenticação nos **CloudWatch Logs** das Lambdas. Não implantamos Prometheus nem Grafana. `GET /api/metricas/tempo-medio-servicos` é métrica de **negócio**, não de infra.

## Consequências

O laboratório fica ocioso em uma réplica e sobe até quatro sob carga. Gargalo de Mongo/SMTP não dispara o HPA. Não há tracing distribuído; correlacionar 500 Gateway vs Express é manual. Se o metrics-server falhar, o HPA fica `Unknown`.

## Alternativas

Descartamos Prometheus + Grafana no recorte. Descartamos KEDA (não há fila). Descartamos Datadog/New Relic. Descartamos só Container Insights. Descartamos duas réplicas fixas, que gastam node sem mostrar autoscaling.
