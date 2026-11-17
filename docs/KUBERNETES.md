# Kubernetes — Service Orders

## Organização e custo

O desenho reutiliza o TechChallenge-Fiap e o Terraform existentes. Não cria outro cluster, load balancer ou instalação de Metrics Server/New Relic.

| Serviço | API base | Workers agrupados | HPA da API | NodePort |
|---|---:|---:|---|---:|
| Service Orders | 1 | 1 (3 processos) | 1–4, CPU 60% | 30080 |
| Execution | 1 | 1 (2 processos) | 1–4, CPU 60% | 30081 |
| Billing | 1 | 1 (4 processos) | 1–4, CPU 60% | 30082 |

São **6 pods de aplicação em execução na base** e até **15** com as três APIs no máximo do HPA. Acrescentam-se 4 pods persistentes do infra-db, componentes do cluster/New Relic e pods temporários de rollout, inicialização e seed. Jobs concluídos continuam listados até serem removidos, conforme o padrão existente.

Cada API replica requests de 100m CPU/128Mi e limits de 500m/256Mi do Fiap. O HPA controla as réplicas; o manifest da API omite replicas para não redefinir a escala em cada deploy. Os workers mantêm uma réplica e o padrão do consumer existente, sem HPA nem novos valores de requests/limits. Agrupar processos reduz pods, mas não garante redução proporcional de RAM; os processos compartilham reinício e escala. O HPA das APIs não aumenta a quantidade de workers nem a capacidade dos nodes.

As configurações existentes de SPOT, tipos/quantidade de nodes e armazenamento permanecem iguais. O Terraform do infra-eks passa a usar EKS 1.37; a atualização de um cluster existente exige etapas por versão minor (ver README do infra-eks). Capacidade e escalabilidade em carga precisam ser verificadas no cluster; a configuração não foi aplicada na AWS. Não pressupor que um único t3.small acomode os workloads e todos os componentes do cluster.

## Ordem de implantação

1. TechChallenge-infra-eks: revisar o plano e aplicar os NodePorts/SSM dos três serviços.
2. TechChallenge-infra-db: executar CD com confirm=yes; cria os bancos e o RabbitMQ compartilhado.
3. TechChallenge-Fiap: executar CD primeiro, pois mantém Metrics Server e o operador New Relic compartilhados.
4. Execution e Billing: executar seus CDs; aguardam o banco/broker, aplicam instrumentação, API, HPA, workers e seed.
5. TechChallenge-lambda-auth: revisar o plano e aplicar as rotas dos serviços.

Os manifests usam o namespace default do padrão existente. A instrumentação fica em newrelic. Cada CD mantém os mesmos gatilhos e tags do Fiap: CI aprovado em main/develop/release ou execução manual com confirm=yes; release usa homolog, demais usam latest. Os branches compartilham o mesmo ambiente do modelo original.

Mantenha SAGA_ENABLED=false no ConfigMap do Orders durante o primeiro deploy. Após todos os participantes estarem prontos, altere esse valor para true e faça novo rollout do Orders para iniciar novas OS pelo fluxo Saga. Os workers dos participantes já ficam ativos. As chaves de integração e o broker devem ser consistentes antes desse passo.

## Validação no cluster

```bash
kubectl get deploy api-deployment service-orders-billing-consumer execution-deployment execution-workers billing billing-workers
kubectl get hpa api-hpa execution-hpa billing-hpa
kubectl top pods
kubectl get pods -A
kubectl get pvc
kubectl get events --sort-by=.lastTimestamp
```

Confirmar READY nos Deployments, TARGETS numéricos nos HPAs, PVCs Bound e ausência de Pending/OOMKilled. Verificar a escala com carga e medir memória/CPU dos workers antes de alterar limites, réplicas ou nodes.

O Gateway mantém JWT nas rotas /api: pecas, servicos, estoque, execucoes-servico e metricas vão ao Execution; orcamentos vai ao Billing; o restante continua no Orders. POST /webhooks/mercado-pago vai ao Billing sem JWT e valida assinatura no aplicativo. /internal permanece sem rota pública no Gateway. Configurar no Mercado Pago a URL HTTPS do Gateway com esse caminho; checkout exige as credenciais reais do provedor. Smoke tests locais de Docker não validam o pagamento nem a implantação AWS.

## Configuração do Orders

O CD preserva o Secret api-secrets existente e aplica um patch de stringData com GitHub Secrets obrigatórios: GATEWAY_TRUST_SECRET, BILLING_INTERNAL_API_KEY, EXECUTION_INTERNAL_API_KEY, SERVICE_ORDERS_INTERNAL_API_KEY e RABBITMQ_URL. BILLING_INTERNAL_API_KEY deve ser o INTERNAL_API_KEY do Billing; EXECUTION_INTERNAL_API_KEY deve ser o INTERNAL_API_KEY do Execution; a chave SERVICE_ORDERS_INTERNAL_API_KEY deve coincidir no Execution e Orders. AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DOCKERHUB_USERNAME e DOCKERHUB_PASSWORD seguem o pipeline existente. Não exportar valores reais de Secret para novos commits.

ConfigMap api-config: Mongo com replicaSet=orders-rs, EXECUTION_SERVICE_URL=http://execution-service e BILLING_SERVICE_URL=http://billing. Os Services expõem porta 80 internamente. Compartilhar o mesmo GATEWAY_TRUST_SECRET com os dois serviços e o lambda-auth; RABBITMQ_URL usa rabbitmq-service e as credenciais/vhost do infra-db.

O recurso existente service-orders-billing-consumer foi preservado para não deixar um Deployment antigo órfão. Agora seu container consumer executa billing-consumer, execution-consumer e saga-worker via run-workers.cjs. Mantém uma réplica.

O CD continua responsável pelo Metrics Server e New Relic compartilhados. A API usa api-deployment/api-service/api-hpa; o seed mantém api-seed-job, uma vez. Veja [Execution](https://github.com/ruanngodinho/techchallenge-execution) e [Billing](https://github.com/ruanngodinho/techchallenge-billing) para seus pipelines e secrets.
