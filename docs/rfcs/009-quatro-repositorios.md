# RFC – Separação em quatro repositórios

| Campo | Valor |
|---|---|
| **Número** | 009 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-009](../adrs/009-quatro-repositorios.md) |

## Resumo

Dividir a entrega em **quatro repositórios** com ciclos de vida distintos: API/K8s, Terraform EKS, Lambda/API Gateway e Atlas opt-in. O monorepo `main` permanece intocado até o cutover; states Terraform novos usam keys `split/...`.

## Problema

No monorepo, um push na API pode disparar (ou assustar) apply de EKS, Lambda e banco. Pipelines, secrets e revisores se misturam: quem mexe em use case de OS não deveria ter o mesmo risco de destruir o cluster.

Auth serverless, cluster e Atlas mudam em ritmos diferentes da aplicação. Um único `terraform.tfstate` acopla tudo.

## Proposta técnica

| # | Repositório | Conteúdo | Pipeline |
|---|---|---|---|
| 4 | `TechChallenge-Fiap` (este) | API, Dockerfile, `k8s/` (API + Mongo) | `ci.yml` + `cd.yml` |
| 2 | `TechChallenge-infra-eks` | VPC, EKS, SSM, bootstrap S3 | Terraform |
| 1 | `TechChallenge-lambda-auth` | Lambdas JWT + API Gateway | Jest + Terraform |
| 3 | `TechChallenge-infra-db` | Atlas M0 opt-in | Terraform |

Contrato entre repos: **SSM** (`backend_url`, `mongodb_uri`) e o **mesmo** `GATEWAY_TRUST_SECRET` nos dois lados.

Ordem de subida: bootstrap/EKS → (opcional) Atlas → app no cluster → Lambda/Gateway.

Enquanto `main` não recebe a branch `feat/split-four-repos`, produção continua no state antigo; os repos novos **não** aplicam contra `eks/terraform.tfstate`.

## Impacto esperado

**Ganhos**

- Blast radius: CI da API não aplica VPC.
- Secrets no GitHub Actions ficam no repo que precisa deles.
- IaC de Atlas pode ficar desligado (`enable_managed_db`) sem poluir o CD da API.

**Riscos e restrições**

- Quatro clones, quatro Actions, quatro PRs para uma mudança transversal (ex.: novo header).
- Drift: Gateway aponta para `backend_url` velho se o node mudar ([RFC-008](008-nodeport-sem-alb.md)).
- Cutover da `main` precisa de runbook para não haver dois clusters/states.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **Monorepo único** (status atual da `main`) | Simples de clonar. Pipelines e state únicos aumentam o risco de apply acidental. |
| **Monorepo com workspaces Terraform isolados** | Melhora o state, não isola permissões GitHub nem o ciclo da Lambda. |
| **Dois repos** (app+k8s vs. “toda infra”) | Lambda + EKS + Atlas ainda acoplados no mesmo apply. |
| **Polyrepo por microsserviço** | Contradiz o [RFC-005](005-monolito-modular.md). |

## Pontos em aberto

- Critério de merge da branch na `main` (smoke no Gateway + `/api/me` + abertura de OS).
- Versionar o contrato SSM (schema dos parâmetros) para não quebrar a Lambda.
- CODEOWNERS por repo quando houver mais de um revisor.
