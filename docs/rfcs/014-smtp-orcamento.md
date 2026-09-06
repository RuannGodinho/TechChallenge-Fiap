# RFC – Notificação de orçamento por SMTP

| Campo | Valor |
|---|---|
| **Número** | 014 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-014](../adrs/014-smtp-orcamento.md) |

## Resumo

Ao criar um orçamento pendente, enviar e-mail **SMTP** (Nodemailer) com o resumo (peças, serviços, total, validade). O domínio fala com a port `email`; o adapter lê `SMTP_*` e `ORCAMENTO_EMAIL_TO`. Não usar SES, fila nem template service nesta fase.

## Problema

O fluxo da oficina não termina na persistência da OS: o cliente precisa do orçamento fora do Swagger. Sem notificação, a aprovação fica só na API. Serviços de e-mail gerenciados (SES, SendGrid) exigem domínio verificado e billing extra.

A regra “quando o orçamento fica pendente, avisa” deve permanecer no caso de uso, não no controller.

## Proposta técnica

- Port em `src/application/ports/email.port.ts`.
- Adapter `nodemailer-email.adapter.ts`.
- Variáveis: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (opcional), `SMTP_SECURE`, `ORCAMENTO_EMAIL_TO` (destinatário único de laboratório).
- Falha de SMTP é erro de aplicação (`email.errors`) — não silenciar no use case.
- Compose injeta o `.env`; o cluster precisa das mesmas chaves no Secret quando o e-mail for testado no EKS.

Não há outbox nem retry persistente: uma tentativa no request.

## Impacto esperado

**Ganhos**

- Demonstra integração externa sem acoplar o enterprise ao Nodemailer ([RFC-004](004-clean-architecture.md)).
- Qualquer SMTP (Gmail app password, Mailhog local, SES SMTP) cabe nas variáveis.
- Destinatário único simplifica a demo.

**Riscos e restrições**

- Latência e timeout do SMTP entram no `PUT`/`POST` do orçamento.
- Sem fila: se o SMTP cair, o orçamento pode ter sido gravado e o e-mail não (ou o contrário, conforme a ordem no use case — precisa permanecer explícita).
- `ORCAMENTO_EMAIL_TO` não é o e-mail do cliente da OS; é caixa da oficina/demo.
- Credenciais SMTP no Secret; nunca no Git.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **Amazon SES API** | Integra AWS. Exige identities, sandbox e SDK; SMTP cobre o mesmo caso com port genérica. |
| **SendGrid / Mailgun HTTP** | Outro vendor e API key. SMTP é o menor denominador. |
| **SQS + worker** | Desacopla latência. Mais um consumidor no cluster, fora do prazo. |
| **Somente persistir, sem e-mail** | Mais simples; não demonstra o fluxo de orçamento com o cliente. |
| **WhatsApp / SMS** | Canal da oficina real; contrato e custo fora do lab. |

## Pontos em aberto

- Ordem transacional: gravar orçamento só após SMTP OK vs. outbox (gravar sempre, enviar depois).
- Destinatário = e-mail do `Cliente` quando o cadastro tiver esse campo confiável.
- Mailhog/Mailpit no Compose para não depender de Gmail nos testes.
