# ADR – Entregamos a API com Docker Hub e GitHub Actions

| Campo | Valor |
|---|---|
| **Número** | 011 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-011](../rfcs/011-cicd-docker-github-actions.md) |

## Contexto

Deploy manual não prova que a imagem no EKS passou nos testes. O cluster precisa puxar um artefato reproduzível. Este repositório não deve aplicar Terraform de VPC. Nesta branch, CD automático na `main` não pode sobrescrever o laboratório atual.

## Decisão

Empacotamos a API em **Docker** (multi-stage `node:20-alpine`) e publicamos `ruanngodinho/techchallenge:latest` no **Docker Hub**. O **GitHub Actions** roda CI (`npm ci`, typecheck, testes) em PR/push. O CD só segue CI verde: push da imagem, `kubectl apply` e rollout. Nesta branch o CD de cluster é **`workflow_dispatch`** com confirmação.

## Consequências

Nenhum deploy de API sem testes, com o mesmo Dockerfile do Compose. Tag `:latest` é mutável e dificulta rollback. O Actions guarda chaves AWS com poder de `kubectl`. Docker Hub impõe rate limit e secret de pull.

## Alternativas

Descartamos ECR neste recorte (Hub já está no `imagePullSecrets`). Descartamos GitLab CI. Descartamos Argo CD/Flux como passo seguinte, não o mínimo do challenge. Descartamos CD no mesmo job do CI sem gate.
