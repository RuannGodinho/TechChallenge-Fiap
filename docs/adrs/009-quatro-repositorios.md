# ADR – Separamos a entrega em quatro repositórios

| Campo | Valor |
|---|---|
| **Número** | 009 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-009](../rfcs/009-quatro-repositorios.md) |

## Contexto

No monorepo, um push da API pode se misturar a apply de VPC, Lambda e Atlas. Secrets, revisores e ritmos de mudança são diferentes. Dois `terraform apply` no mesmo state se atropelam. A `main` ainda entrega o laboratório atual; a branch de split não pode corromper esse state.

## Decisão

Separamos a entrega em **quatro repositórios**: API e manifests K8s (`TechChallenge-Fiap`); Terraform EKS; Lambdas e API Gateway; Atlas opt-in. O contrato entre eles é o **SSM** e o `GATEWAY_TRUST_SECRET`. States novos usam keys `split/...` e não aplicam contra o state do monorepo até o cutover.

## Consequências

Reduzimos o blast radius e isolamos pipelines. Mudança transversal exige quatro PRs e há risco de drift do `backend_url`. O cutover da `main` precisa de runbook explícito.

## Alternativas

Descartamos permanecer só no monorepo. Descartamos monorepo com workspaces Terraform (isola state, não permissão GitHub). Descartamos dois repos (“app vs toda infra”). Descartamos um repo por microsserviço, em conflito com a [ADR-005](005-monolito-modular.md).
