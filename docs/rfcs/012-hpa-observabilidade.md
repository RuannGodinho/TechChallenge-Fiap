# RFC – Autoscaling por CPU e observabilidade de laboratório

| Campo | Valor |
|---|---|
| **Número** | 012 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-012](../adrs/012-hpa-observabilidade.md) |

## Resumo

Escalar a API com **HPA** (1–4 réplicas, CPU média 60% do request `100m`) alimentado pelo **metrics-server**. Logs de autenticação no **CloudWatch** das Lambdas. Sem Prometheus/Grafana neste recorte.

## Problema

Uma réplica fixa não demonstra o requisito de escalabilidade. Sem métrica no cluster, o HPA não dispara. Observabilidade “completa” (Prometheus, Grafana, APM) compete com o prazo e com o custo do node.

Precisamos do mínimo que prove: o pod sobe CPU, o HPA cria réplica, o login deixa rastro auditável.

## Proposta técnica

| Peça | Escopo | Função |
|---|---|---|
| `metrics-server` | `kube-system` | CPU/memória (`metrics.k8s.io`) |
| `api-hpa` | `api-deployment` | min 1, max 4, CPU 60% |
| Requests/limits | Deployment da API | Base do cálculo do HPA (`100m` CPU) |
| CloudWatch Logs | AuthSign e Authorizer | 401, invocações, JWT inválido |
| `GET /api/metricas/tempo-medio-servicos` | Negócio | Tempo médio de execução — **não** é métrica de infra |

Verificação operacional: `kubectl top` e `kubectl describe hpa`.

Não há sidecar de telemetria nem ServiceMonitor. O Compose local não tem HPA.

## Impacto esperado

**Ganhos**

- Escala sem intervenção até 4 pods.
- Custo de lab: 1 réplica ociosa.
- Auditoria de auth fora do log da API.

**Riscos e restrições**

- CPU 60% não captura gargalo de I/O no Mongo ou de SMTP.
- Máximo 4 é teto pedagógico, não capacidade de oficina real.
- Sem traces distribuídos, um 500 no Gateway vs. Express exige correlacionar na mão.
- metrics-server no `kubectl apply` do CD: se falhar, o HPA fica `Unknown`.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **Prometheus + Grafana + HPA custom** | Padrão de produção. Addon, persistência e dashboards excedem o recorte. |
| **KEDA** (escala por fila/HTTP) | Não há fila; tráfego é síncrono REST. |
| **Datadog / New Relic** | SaaS com agente; custo e conta extra. |
| **Somente CloudWatch Container Insights** | Útil, pago por métrica; o HPA precisaria de adapter. metrics-server é o caminho nativo do exercício. |
| **Réplicas fixas = 2** | Simples, gasta node sem demonstrar autoscaling. |

## Pontos em aberto

- Alarme CloudWatch em taxa de 401 do Authorizer.
- Incluir memória no HPA se o Node saturar RAM antes de CPU.
- Correlation id (header) do Gateway até o Express para o próximo nível de log.
