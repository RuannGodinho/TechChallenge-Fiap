# Passo a passo — GitHub Actions

Nesta branch este repositório só entrega a **API no EKS**. Infra EKS, Lambda e Atlas têm pipelines nos repos irmãos ([REPOS.md](REPOS.md)).

## Mapa dos workflows (este repo)

| Workflow | Arquivo | Gatilho | O que faz |
|---|---|---|---|
| **CI** | `ci.yml` | PR + push `main` / `develop` / `feat/split-four-repos` | `npm ci` → build → test |
| **CD** | `cd.yml` | CI OK no push `main` ou manual | Docker push + deploy `k8s/` |

```mermaid
flowchart LR
  subgraph app [Este repo]
    P[push]
    C[CI]
    D[CD]
  end

  subgraph others [Repos irmaos]
    EKS[TechChallenge-infra-eks]
    LAM[TechChallenge-lambda-auth]
  end

  EKS -->|cluster pronto| D
  P --> C -->|success| D
  LAM -->|API Gateway apos a API| D
```

---

## Secrets neste repositório (app / CD)

| Secret | Para que serve |
|---|---|
| `AWS_ACCESS_KEY_ID` | `aws eks update-kubeconfig` no CD |
| `AWS_SECRET_ACCESS_KEY` | Par da chave acima |
| `DOCKERHUB_USERNAME` | Push da imagem |
| `DOCKERHUB_PASSWORD` | Token Docker Hub |
| `GATEWAY_TRUST_SECRET` | Patch do Secret K8s (`X-Gateway-Trust`) — o mesmo valor do repo Lambda |

Variables: `TF_AWS_REGION` (default `us-east-1`), `TF_CLUSTER_NAME` (default `techchallenge-eks`).

Terraform, JWT_SECRET e AUTH_* ficam no [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks) e no [TechChallenge-lambda-auth](https://github.com/RuannGodinho/TechChallenge-lambda-auth).

---

## Deploy da API

1. Cluster EKS existente (monorepo `main` ou, após cutover, apply no repo EKS).
2. Push nesta branch dispara CI. CD automático continua amarrado à `main` — deploy desta branch é **manual** (`workflow_dispatch` com `confirm=yes`) para não alterar produção sem querer.
3. O CD aplica metrics-server, secrets, Mongo in-cluster, API, HPA e seed.

Passo a passo de Kubernetes: [KUBERNETES.md](KUBERNETES.md).
