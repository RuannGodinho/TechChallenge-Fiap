# Dashboards e alertas New Relic (negócio)

Consultas para colar na UI do New Relic (Logs / NRQL). Fonte: stdout JSON da API, encaminhado pelo Fluent Bit.

Filtro comum: `event = 'business'`. Correlação: `requestId` (ALS) e `trace.id` (agente APM).

Rotas reais: `/api/ordensServico` e `/api/execucoes-servico`.

## Dashboards

### Volume diário de ordens de serviço

```sql
SELECT count(*) FROM Log
WHERE event = 'business' AND msg = 'os_created'
TIMESERIES 1 day
```

### Tempo médio por status (minutos)

Diagnóstico = `EM DIAGNOSTICO`. Execução = `EM EXECUCAO`. Finalização = `FINALIZADA` (duração até `ENTREGUE`).

```sql
SELECT average(durationMs) / 60000 FROM Log
WHERE event = 'business' AND msg = 'os_status_changed'
  AND `from` IN ('EM DIAGNOSTICO', 'EM EXECUCAO', 'FINALIZADA')
FACET `from`
```

### Erros e falhas nas integrações

```sql
SELECT count(*) FROM Log
WHERE msg IN ('smtp_send_failed', 'integration_failed')
FACET integration, msg
TIMESERIES
```

Amarrar à OS: `SELECT * FROM Log WHERE msg IN ('smtp_send_failed', 'integration_failed') AND ordemServicoId IS NOT NULL`.

## Alertas (criar na UI)

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
