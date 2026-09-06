# RFC – Entrega contínua: Docker Hub e GitHub Actions

| Campo | Valor |
|---|---|
| **Número** | 011 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-011](../adrs/011-cicd-docker-github-actions.md) |

## Resumo

Empacotar a API em **Docker** (`node:20-alpine`) e entregar com **GitHub Actions**: CI (`npm ci`, typecheck, testes) em PR/push; CD só após CI verde — build/push `ruanngodinho/techchallenge:latest` e `kubectl apply` no EKS.

## Problema

Deploy manual (`docker build` no notebook + `kubectl` local) não garante que o que está no cluster passou nos testes, nem que a imagem no node é a mesma do commit. O challenge pede pipeline. Sem registry, o EKS não puxa a imagem de forma reproduzível.

O CD não pode aplicar Terraform de VPC neste repo ([RFC-009](009-quatro-repositorios.md)): só a aplicação.

## Proposta técnica

| Workflow | Gatilho | Função |
|---|---|---|
| `ci.yml` | PR e push (`main`, `develop`, `feat/split-four-repos`) | `npm ci` → build/typecheck → `npm test` |
| `cd.yml` | CI OK no push `main`, ou `workflow_dispatch` com `confirm=yes` | Docker Hub → kubeconfig → apply `k8s/` → rollout |

Imagem multi-stage: `deps` (`npm ci`) + `runner` (USER `node`, `npm start`). Tag de laboratório: `:latest` (simplicidade; o CD faz `rollout restart` para puxar de novo).

Secrets no repo da API: AWS (kubeconfig), Docker Hub, `GATEWAY_TRUST_SECRET`. JWT e usuários de auth ficam no repo das Lambdas.

Nesta branch o CD automático **não** aponta para produção: deploy é manual para não sobrescrever o cluster da `main`.

```text
push → CI verde → (main) CD → Docker Hub → EKS
                 → (esta branch) CD só workflow_dispatch
```

## Impacto esperado

**Ganhos**

- Nenhum deploy de API sem testes.
- Mesmo Dockerfile que o Compose.
- Rollout Kubernetes depois de push na `main`.

**Riscos e restrições**

- Tag `:latest` é mutável: rollback exige rebuild de um commit antigo ou tags imutáveis (`:git-sha`).
- Docker Hub rate limit e imagem privada (`dockerhub-cred`).
- Credenciais AWS no Actions têm poder de `kubectl` no cluster.
- `workflow_dispatch` nesta branch evita acidente, mas o operador pode confirmar errado.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **Amazon ECR** | Mais AWS-nativo. Docker Hub já está no fluxo e no `imagePullSecrets`; ECR exigiria IAM no node e no Actions sem ganho pedagógico. |
| **GitLab CI / CircleCI** | O código já está no GitHub. |
| **Argo CD / Flux (GitOps)** | Destino certo a médio prazo. Para o lab, Actions + `kubectl apply` é o mínimo demonstrável. |
| **Deploy só local** | Não atende CI/CD do challenge. |
| **CD no mesmo job do CI sem gate** | Imagem quebrada iria para o cluster. |

## Pontos em aberto

- Tag imutável por SHA e `imagePullPolicy` compatível.
- Cache de `npm ci` e layers no Actions para acelerar.
- Sonar (`npm run sonar`) no CI quando houver token estável — hoje é script local.
