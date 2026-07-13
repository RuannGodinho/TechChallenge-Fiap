# Deploy em Kubernetes

Como a aplicação roda **dentro do EKS**: manifests, ordem de deploy, acesso e comportamento idempotente em re-deploys.

## Pré-requisitos

- Cluster **EKS** ativo (`techchallenge-eks`) — ver [TERRAFORM.md](TERRAFORM.md)
- `kubectl` e `aws` CLI instalados
- Credenciais AWS com acesso ao cluster

```bash
aws eks update-kubeconfig --region us-east-1 --name techchallenge-eks
```

## Visão dos workloads no cluster

```text
namespace: default
├── ConfigMap api-config          (PORT, MONGODB_URI, JWT_EXPIRES_IN)
├── Secret api-secrets            (JWT, credenciais auth, SONAR_TOKEN)
├── Secret dockerhub-cred         (pull da imagem privada)
├── Deployment mongo-deployment   (MongoDB 8 + volume EBS)
├── PVC mongo-pvc                 (1Gi, storageClassName: gp2)
├── Service mongo-service         (ClusterIP :27017)
├── Deployment api-deployment     (imagem Docker Hub, 1 réplica base)
├── Service api-service           (NodePort 30080 → container :3000)
├── HPA api-hpa                   (1–4 réplicas, CPU 60%)
└── Job api-seed-job              (seed Mongo — uma vez)

namespace: kube-system
└── Deployment metrics-server     (métricas para HPA)
```

## Descrição de cada manifest

| Arquivo | Recurso | Detalhe |
|---|---|---|
| `k8s/secrets/Api-configmap.yml` | ConfigMap | URI do Mongo interno (`mongo-service:27017`) |
| `k8s/secrets/api-secrets.yml` | Secret | Variáveis sensíveis da API |
| `k8s/secrets/dockerhub-cred.yml` | Secret | `imagePullSecrets` para Docker Hub |
| `k8s/mongo/mongo-storageclass.yml` | StorageClass | `gp2` via EBS CSI (só se não existir) |
| `k8s/mongo/mongo-pvc.yml` | PVC | 1Gi persistente para Mongo |
| `k8s/mongo/mongo-deployment.yml` | Deployment | MongoDB com volume montado |
| `k8s/mongo/mongo-service.yml` | Service | DNS interno `mongo-service` |
| `k8s/Api-deployment.yml` | Deployment | API com requests/limits CPU e memória |
| `k8s/Api-service.yml` | Service | **NodePort 30080** — acesso externo |
| `k8s/API-hpa.yml` | HPA | Escala quando CPU média > 60% do request (`100m`) |
| `k8s/metrics-server.yml` | Deployment | Necessário para `kubectl top` e HPA |
| `k8s/api-seed-job.yml` | Job | Executa `mongo-init/seed.js` uma vez |

## Horizontal Pod Autoscaler

- **Mínimo:** 1 réplica (custo em lab)
- **Máximo:** 4 réplicas
- **Métrica:** CPU média dos pods em 60% do request configurado
- **Dependência:** metrics-server instalado e funcional

## Deploy via GitHub Actions

O workflow **CD** (`.github/workflows/cd.yml`) executa automaticamente após CI verde no push em `main`. Ordem interna:

1. Build e push `ruanngodinho/techchallenge:latest`
2. `aws eks update-kubeconfig`
3. metrics-server → secrets → Mongo → API → HPA
4. Seed job (só se não existir)
5. `rollout restart` da API para puxar imagem `:latest`

Passo a passo completo: [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md).

## Deploy manual com kubectl

```bash
aws eks update-kubeconfig --region us-east-1 --name techchallenge-eks

# 1. Métricas (HPA)
kubectl apply -f k8s/metrics-server.yml
kubectl rollout status deployment/metrics-server -n kube-system --timeout=180s

# 2. Config e secrets
kubectl apply -f k8s/secrets/Api-configmap.yml
kubectl apply -f k8s/secrets/api-secrets.yml
kubectl apply -f k8s/secrets/dockerhub-cred.yml

# 3. Mongo (StorageClass só na primeira vez se gp2 não existir)
kubectl get storageclass gp2 || kubectl apply -f k8s/mongo/mongo-storageclass.yml
kubectl apply -f k8s/mongo/mongo-pvc.yml
kubectl apply -f k8s/mongo/mongo-service.yml
kubectl apply -f k8s/mongo/mongo-deployment.yml
kubectl rollout status deployment/mongo-deployment --timeout=180s

# 4. API
kubectl apply -f k8s/Api-deployment.yml
kubectl apply -f k8s/Api-service.yml
kubectl apply -f k8s/API-hpa.yml

# 5. Seed (apenas primeira vez)
kubectl get job api-seed-job || kubectl apply -f k8s/api-seed-job.yml
```

## Verificação e acesso

```bash
kubectl get pods -A
kubectl get svc api-service
kubectl get nodes -o wide
kubectl top pods          # requer metrics-server
kubectl describe hpa api-hpa
```

**URL da API:**

```text
http://<IP_PUBLICO_DO_NODE>:30080/api
http://<IP_PUBLICO_DO_NODE>:30080/docs
```

## Comportamento em re-deploy

| Recurso | Comportamento |
|---|---|
| StorageClass `gp2` | Ignorado se já existir no cluster |
| Job seed | Não recriado se já existir |
| API Deployment | `rollout restart` para atualizar imagem `:latest` |
| Secrets | Re-apply idempotente via CD |

> **Importante:** não commite manifests exportados do cluster com `resourceVersion`, `uid` ou `creationTimestamp` — causam conflito no `kubectl apply`.

## Troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| HPA `cpu: <unknown>` | metrics-server ausente | `kubectl apply -f k8s/metrics-server.yml` |
| PVC `Pending` | EBS CSI ou StorageClass | Verificar addon e `kubectl get sc` |
| `ImagePullBackOff` | Secret `dockerhub-cred` | Verificar credencial Docker Hub |
| API não responde em :30080 | SG do node | Terraform libera NodePort 30080 |
| Secret conflict no apply | YAML exportado do cluster | Remover `resourceVersion`, `uid` dos manifests |
| StorageClass gp2 forbidden | Já existe no EKS | Pular `mongo-storageclass.yml` |

## Documentação relacionada

- [Arquitetura](ARQUITETURA.md)
- [Terraform](TERRAFORM.md)
- [GitHub Actions](GITHUB-ACTIONS.md)
