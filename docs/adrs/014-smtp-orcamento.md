# ADR – Notificamos orçamento pendente por SMTP

| Campo | Valor |
|---|---|
| **Número** | 014 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-014](../rfcs/014-smtp-orcamento.md) |

## Contexto

Orçamento aprovável precisa sair do Swagger e chegar à oficina/cliente. SES/SendGrid exigem domínio e billing. A regra de envio pertence ao caso de uso, não ao controller. No laboratório um destinatário único basta.

## Decisão

Enviamos e-mail **SMTP** via Nodemailer quando o orçamento fica pendente. O domínio usa a port `email`; o adapter lê `SMTP_*` e `ORCAMENTO_EMAIL_TO`. Não usamos SES API, fila nem worker. Falha de SMTP é erro de aplicação, não log silencioso.

## Consequências

Qualquer SMTP (incluindo Mailhog) cabe nas variáveis e o enterprise não conhece Nodemailer. A latência do SMTP entra no request. Sem outbox, persistência e envio podem divergir. O destinatário é caixa de demo, não necessariamente o e-mail do `Cliente`. Credenciais não podem ir para o Git.

## Alternativas

Descartamos SES API, SendGrid/Mailgun HTTP, SQS+worker e WhatsApp/SMS. Descartamos só persistir sem notificar, porque perde o fluxo com o cliente.
