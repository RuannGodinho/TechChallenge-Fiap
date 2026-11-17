# Teste local: da OS ao pagamento e à entrega automática

## Regra e recuperação

O Service Orders entrega automaticamente somente uma OS `FINALIZADA`, com evento `payment.confirmed` registrado e consulta autenticada ao Billing retornando `paid: true`. O Billing consulta a order no Mercado Pago e verifica referência, moeda e valor integral acreditado. Criar checkout ou aprovar orçamento não autoriza entrega.

A gravação de status/histórico compara o status anterior para evitar entregas duplicadas. Confirmação antecipada aguarda a execução. O consumidor de Billing reconcilia confirmações retidas em lotes de 50, com dez segundos entre lotes, recuperando indisponibilidade e falhas após gravar o evento. Erros de consulta não autorizam entrega. O fluxo é eventualmente consistente.

Neste projeto, `ENTREGUE` passa a representar o encerramento automático após pagamento. Estornos posteriores são registrados e não reabrem automaticamente uma OS já entregue.

## 1. Configuração local

Use as pastas `/Users/ruanngodinho/TechChallenge-Fiap`, `/Users/ruanngodinho/TechChallenge-Execution` e `/Users/ruanngodinho/TechChallenge-Billing`. Preserve senhas e volumes existentes. Este teste cria uma OS nova e consome uma unidade do filtro do seed.

Confira os `.env`:

| Configuração | Valor/correspondência |
| --- | --- |
| Todos: `AUTH_MODE` | `local` |
| Todos: `JWT_SECRET` | mesmo valor |
| Service Orders: `SAGA_ENABLED` | `true`, antes de criar a OS |
| Service Orders: `BILLING_SERVICE_URL` | `http://host.docker.internal:3002` |
| Service Orders: `BILLING_INTERNAL_API_KEY` | Billing `INTERNAL_API_KEY` |
| Service Orders: `EXECUTION_SERVICE_URL` | `http://host.docker.internal:3001` |
| Service Orders: `EXECUTION_INTERNAL_API_KEY` | Execution `INTERNAL_API_KEY` |
| Execution: `SERVICE_ORDERS_URL` | `http://host.docker.internal:3000` |
| Execution: `SERVICE_ORDERS_INTERNAL_API_KEY` | igual à variável homônima do Service Orders |
| Execution: `EXECUTION_COMPLETION_TRANSPORT` | `rabbitmq` |
| Todos: `RABBITMQ_URL` | mesmos usuário/senha/vhost; Billing usa host `rabbitmq`, demais usam `host.docker.internal` |
| Billing SMTP | host `mailpit`, porta `1025`, `SMTP_SECURE=false`, credenciais SMTP vazias |

No Billing, configure **credenciais de teste** da aplicação Mercado Pago:

```dotenv
MERCADO_PAGO_ACCESS_TOKEN=COLE_O_ACCESS_TOKEN_DE_TESTE
MERCADO_PAGO_WEBHOOK_SECRET=COLE_A_ASSINATURA_SECRETA_DO_WEBHOOK_DE_TESTE
```

O secret é gerado ao configurar Webhooks. Referências oficiais: [ambiente de testes](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/integration-test-introduction?scope=prod) e [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications).

Recrie os containers após editar configurações:

```bash
cd /Users/ruanngodinho/TechChallenge-Billing && docker compose up -d --build --remove-orphans
cd /Users/ruanngodinho/TechChallenge-Execution && docker compose up -d --build --remove-orphans
cd /Users/ruanngodinho/TechChallenge-Fiap && docker compose up -d --build --remove-orphans
curl -i http://localhost:3000/ready
curl -i http://localhost:3001/ready
curl -i http://localhost:3002/ready
```

Os três `/ready` devem responder 200. Mantenha os seeds habilitados para os exemplos abaixo.

## 2. Webhook HTTPS

Com o [ngrok instalado e autenticado](https://ngrok.com/docs/start), mantenha outro Terminal executando:

```bash
ngrok http 3002
```

No painel Mercado Pago, abra a aplicação, Webhooks, ambiente **Teste**. Configure `https://SEU-ENDERECO.ngrok.app/webhooks/mercado-pago` usando o endereço real do túnel e selecione **Order (Mercado Pago)**. Salve a assinatura secreta no `.env` do Billing e recrie seus containers caso ela tenha mudado. Atualize o painel quando mudar o endereço do túnel.

O webhook valida `x-signature`; não adicione chaves internas na URL. Um POST manual sem assinatura deve retornar 401. O simulador do painel testa o transporte, mas um ID fictício não comprova pagamento. A demonstração completa precisa do webhook de uma order efetivamente paga no ambiente de teste.

## 3. Login, veículo e OS nova

Use o mesmo Terminal durante os passos seguintes. Copie os IDs das respostas para as variáveis indicadas.

```bash
curl -sS -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' -d '{"cpf":"81788455045"}'
TOKEN='COLE_O_TOKEN'

curl -sS http://localhost:3000/api/veiculos -H "Authorization: Bearer $TOKEN"
VEICULO_ID='COLE_O_ID_DE_UM_VEICULO'
CRIACAO_KEY=$(uuidgen)
curl -i -X POST http://localhost:3000/api/ordensServico \
  -H "Authorization: Bearer $TOKEN" -H "Idempotency-Key: $CRIACAO_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"cpfCnpj\":\"81788455045\",\"veiculoId\":\"$VEICULO_ID\",\"pecas\":[],\"servicos\":[]}"
OS_ID='COLE_O_ID_DA_OS'
```

Espere HTTP 201 e status `RECEBIDA`. Use a OS criada aqui; as referências fictícias do seed do Billing não representam OS integradas.

## 4. Diagnóstico e aprovação

```bash
curl -i -X PUT "http://localhost:3000/api/ordensServico/$OS_ID" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"EM DIAGNOSTICO"}'
DIAGNOSTICO_KEY=$(uuidgen)
curl -i -X PUT "http://localhost:3000/api/ordensServico/$OS_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Idempotency-Key: $DIAGNOSTICO_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"pecas":[{"pecaId":"00000000000000000000a002","quantidade":1}],"servicos":["00000000000000000000b001"]}'
curl -sS "http://localhost:3000/api/ordensServico/$OS_ID/saga" -H "Authorization: Bearer $TOKEN"
curl -sS "http://localhost:3002/api/orcamentos/$OS_ID" -H "Authorization: Bearer $TOKEN"
```

Aguarde `AGUARDANDO_APROVACAO` e confira o orçamento no Mailpit (`http://localhost:8025`). O seed original soma R$ 185,00 (filtro de R$ 35,00 e serviço de R$ 150,00); confira os preços retornados se seus dados foram alterados.

```bash
ORCAMENTO_ID='COLE_O_UUID_DO_ULTIMO_ORCAMENTO'
curl -i -X PUT "http://localhost:3002/api/orcamentos/$ORCAMENTO_ID" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"status":"APROVADO"}'
curl -sS "http://localhost:3000/api/ordensServico/$OS_ID/saga" -H "Authorization: Bearer $TOKEN"
```

Aguarde a Saga `CONCLUIDA`: reserva, preparação e autorização devem estar confirmadas. Em rejeição ou falta de estoque, espere compensação e não avance para cobrança.

## 5. Executar os serviços

```bash
curl -sS "http://localhost:3001/api/execucoes-servico/$OS_ID" -H "Authorization: Bearer $TOKEN"
EXECUCAO_ID='COLE_O_ID_DA_EXECUCAO'
curl -i -X PATCH "http://localhost:3001/api/execucoes-servico/$EXECUCAO_ID/iniciar" \
  -H "Authorization: Bearer $TOKEN"
curl -i -X PATCH "http://localhost:3001/api/execucoes-servico/$EXECUCAO_ID/finalizar" \
  -H "Authorization: Bearer $TOKEN"

ORDERS_KEY='COLE_SERVICE_ORDERS_INTERNAL_API_KEY_DO_SERVICE_ORDERS'
curl -sS "http://localhost:3000/internal/ordensServico/$OS_ID" -H "x-internal-api-key: $ORDERS_KEY"
```

Se houver várias execuções, inicie/finalize todas. A conclusão da última publica `execution.completed`. Aguarde a OS `FINALIZADA` e o Billing receber a mesma conclusão. Ela deve permanecer sem entrega enquanto não houver pagamento confirmado.

## 6. Gerar checkout e pagar em Teste

Use `INTERNAL_API_KEY` do Billing nos endpoints de cobrança:

```bash
BILLING_KEY='COLE_INTERNAL_API_KEY_DO_BILLING'
CHECKOUT_KEY=$(uuidgen)
curl -i -X POST "http://localhost:3002/internal/orders/$OS_ID/checkout" \
  -H "x-internal-api-key: $BILLING_KEY" -H "idempotency-key: $CHECKOUT_KEY" \
  -H 'Content-Type: application/json' -d '{}'
```

Guarde `id` (tentativa), `status` e `checkoutUrl`. Em timeout/502, repita com **a mesma** `CHECKOUT_KEY`; não gere outra chave para contornar uma tentativa em andamento. Um 409 pode indicar conclusão ainda não recebida, orçamento inadequado ou tentativa existente: confira o erro e os workers.

Abra `checkoutUrl` em janela anônima. Use os cartões e dados dos cenários aprovado, pendente e rejeitado da [documentação oficial de compra de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/integration-test/test-purchase-with-card?scope=prod). Confira as credenciais de Teste antes de pagar. O retorno do navegador não confirma o pagamento: o Billing valida o webhook e consulta a API do Mercado Pago.

## 7. Confirmar entrega automática

```bash
PAGAMENTO_ID='COLE_O_ID_DA_TENTATIVA_DO_CHECKOUT'
curl -sS "http://localhost:3002/internal/payments/$PAGAMENTO_ID" -H "x-internal-api-key: $BILLING_KEY"
curl -sS "http://localhost:3002/internal/orders/$OS_ID/payment-status" -H "x-internal-api-key: $BILLING_KEY"
curl -sS "http://localhost:3000/internal/ordensServico/$OS_ID" -H "x-internal-api-key: $ORDERS_KEY"
```

Espere tentativa `PAID`, resposta `{"paid":true}`, OS `ENTREGUE` e uma única entrada de `ENTREGUE` no `statusHistory`. Use a consulta por ID porque a listagem operacional pode ocultar OS finalizadas/entregues. Não envie PUT manual para entregar.

Nas pastas Billing e Service Orders, use `docker compose logs -f workers`. Procure `payment.confirmed` e `os_auto_delivered`. No painel Mercado Pago, confirme a entrega do webhook real dessa order com HTTP 200. Consultar o pagamento localmente não comprova o recebimento do webhook.

| Cenário | Resultado esperado |
| --- | --- |
| Execução concluída e checkout criado, sem pagamento | OS `FINALIZADA` |
| Pagamento pendente/rejeitado | Não entrega |
| Pagamento integral confirmado e webhook processado | OS `ENTREGUE` automaticamente |
| Reenviar a mesma notificação pelo painel | Sem duplicar histórico |
| Confirmação chega antes da finalização ao Service Orders | Aguarda execução; entrega após nova verificação |
| Billing indisponível | Mantém status; tenta novamente após recuperação |
| Confirmação antiga de pagamento já estornado | Consulta atual não autoriza entrega |

Use uma OS nova por cenário independente. Não force `PAID` no banco: isso não substitui o pagamento de teste nem a consulta ao provedor.

## Diagnóstico

- Checkout 503: confira o Access Token no container Billing.
- Checkout 409: confira aprovação, conclusão e tentativa existente; preserve a chave original nas repetições.
- Checkout 502: confira logs e API Requests do painel; repita com a mesma chave após corrigir a causa.
- Webhook 401: confira aplicação, ambiente, secret, `data.id` e URL do túnel.
- Aprovado no provedor, pendente localmente: confira o webhook no painel e reenvie a notificação real. Como recuperação, faça `POST /internal/payments/$PAGAMENTO_ID/reconcile` com a chave do Billing; isso consulta o provedor e não comprova o recebimento do webhook.
- Billing `PAID`, OS `FINALIZADA`: confira broker/vhost, URL/chave do Billing no Service Orders, logs `paid_order_delivery_retry` e DLQ `service-orders.billing.dlq`. A reconciliação automática só encontra confirmações já registradas na OS.

## Verificações automatizadas

Na pasta Service Orders:

```bash
npm run typecheck
npm run check:architecture
npm test -- --runInBand --coverage=false --runTestsByPath tests/unit/paymentAutoDelivery.test.ts tests/unit/paymentDeliveryGate.test.ts tests/unit/billingEvents.test.ts tests/unit/executionConsumer.test.ts tests/unit/orderCompletionUseCase.test.ts
```

Esses testes usam dependências simuladas para regras, concorrência e recuperação. O roteiro acima valida separadamente credenciais e webhooks do provedor junto aos containers reais.
