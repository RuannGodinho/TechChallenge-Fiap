# Dashboards e alertas New Relic (negócio)

Fonte: stdout JSON da API (Fluent Bit). Filtro comum: `event = 'business'`. Correlação: `requestId` e `trace.id`.

Rotas reais: `/api/ordensServico` e `/api/execucoes-servico`.

## Qual dashboard usar

Use um **Custom Dashboard** no New Relic, dedicado à oficina — por exemplo **Oficina — Regras de negócio**.

| Superfície | Por que não é a principal |
|---|---|
| **APM (Services)** | Latência, throughput e 5xx de HTTP. Não tem `os_created`, tempo por status nem `reason` de regra. |
| **Kubernetes / Infrastructure** | CPU, pods, HPA. É o recorte da ADR-012, não o enunciado de negócio. |
| **Logs (Query builder)** | Bom para caçar um `requestId`. Ruim para apresentar volume, tempo médio e falhas lado a lado. |
| **Custom Dashboard** | Um quadro com KPI + série temporal + facet + tabela em cima dos mesmos logs. É o que a banca pede. |

Widgets sugeridos nesse dashboard:

1. **Billboard** — OS criadas hoje; falhas de processamento hoje.
2. **Line** — volume diário de OS (`TIMESERIES 1 day`).
3. **Bar** — tempo médio em Diagnóstico, Execução e Finalização (`FACET \`from\``).
4. **Line** — erros SMTP/Mongo no tempo (`FACET integration`).
5. **Pie ou Bar** — falhas de regra por `reason`.
6. **Table** — últimas falhas com `ordemServicoId`, `reason`, `requestId`.

APM continua aberto numa aba para provar o agente. O dashboard de **negócio** é o Custom.

Como criar: **Dashboards → Create a dashboard → Add widget → NRQL**. Cole as queries abaixo. Em cada widget, escolha o tipo indicado.

---

## Queries do dashboard

### 1. OS criadas hoje (Billboard)

```sql
SELECT count(*) FROM Log
WHERE event = 'business' AND msg = 'os_created'
SINCE 1 day ago
```

### 2. Volume diário de OS (Line)

```sql
SELECT count(*) FROM Log
WHERE event = 'business' AND msg = 'os_created'
TIMESERIES 1 day
SINCE 7 days ago
```

### 3. Tempo médio por status, em minutos (Bar)

Diagnóstico = `EM DIAGNOSTICO`. Execução = `EM EXECUCAO`. Finalização = `FINALIZADA` (duração até `ENTREGUE`).

```sql
SELECT average(durationMs) / 60000 AS 'minutos' FROM Log
WHERE event = 'business' AND msg = 'os_status_changed'
  AND `from` IN ('EM DIAGNOSTICO', 'EM EXECUCAO', 'FINALIZADA')
FACET `from`
SINCE 7 days ago
```

### 4. Erros e falhas nas integrações (Line)

```sql
SELECT count(*) FROM Log
WHERE msg IN ('smtp_send_failed', 'integration_failed')
FACET integration, msg
TIMESERIES
SINCE 1 day ago
```

### 5. Falhas de processamento de OS hoje (Billboard)

```sql
SELECT count(*) FROM Log
WHERE event = 'business' AND msg = 'os_processing_failed' AND alert = true
SINCE 1 day ago
```

### 6. Falhas de regra por motivo (Pie)

```sql
SELECT count(*) FROM Log
WHERE event = 'business' AND msg = 'os_processing_failed'
FACET reason
SINCE 7 days ago
```

### 7. Últimas falhas com correlação (Table)

```sql
SELECT ordemServicoId, reason, requestId, `from`, `to`, pecaId
FROM Log
WHERE event = 'business' AND msg = 'os_processing_failed'
SINCE 1 day ago
LIMIT 50
```

### 8. SMTP / Mongo amarrados à OS (Table)

```sql
SELECT ordemServicoId, orcamentoId, integration, msg, requestId
FROM Log
WHERE msg IN ('smtp_send_failed', 'integration_failed')
  AND ordemServicoId IS NOT NULL
SINCE 1 day ago
LIMIT 50
```

---

## Alertas (criar em Alerts → NRQL)

### 1. Falha no processamento de OS

```sql
SELECT count(*) FROM Log
WHERE event = 'business' AND msg = 'os_processing_failed' AND alert = true
```

Cobre: transição ilegal, orçamento não aprovado, estoque insuficiente, execução sem OS em `EM EXECUCAO`.

### 2. SMTP do orçamento falhou

```sql
SELECT count(*) FROM Log
WHERE msg = 'smtp_send_failed'
```

### 3. 5xx em OS e execuções

```sql
SELECT count(*) FROM Log
WHERE msg = 'http_request' AND status >= 500
  AND (path LIKE '/api/ordensServico%' OR path LIKE '/api/execucoes-servico%')
```

---

## Catálogo de `msg`

| msg | Quando |
|---|---|
| `os_created` | OS persistida (`RECEBIDA`) |
| `os_create_rejected` | Cliente ou veículo inexistente |
| `os_status_changed` | Transição válida (`from`, `to`, `durationMs`) |
| `os_processing_failed` | Falha de regra (`alert: true` + `reason`) |
| `os_auto_finalized` | Última execução fechou a OS |
| `orcamento_created` / `orcamento_status_changed` | Criação e aprovação/reprovação |
| `execucao_started` / `execucao_finished` | Início e fim da execução |
| `estoque_movimentado` | Saída de peça com origem `OS` |
| `smtp_sent` / `smtp_send_failed` | E-mail do orçamento (com `ordemServicoId`) |
| `integration_failed` | Mongo falhou no save/update da OS |
