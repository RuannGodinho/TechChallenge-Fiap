# Quatro repositórios

Esta branch (`feat/split-four-repos`) deixa o **TechChallenge-Fiap** só com a aplicação Kubernetes. Lambda, EKS e banco gerenciado foram extraídos.

A `main` do monorepo **não foi alterada**. Merge só depois de validar os quatro repos.

| # | Repositório | Papel | CI/CD |
|---|---|---|---|
| 4 | [TechChallenge-Fiap](https://github.com/RuannGodinho/TechChallenge-Fiap) (este, nesta branch) | API Node, Dockerfile, manifests K8s (API + Mongo in-cluster) | `ci.yml` + `cd.yml` |
| 2 | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks) | Terraform VPC + EKS + SSM | GitHub Actions Terraform |
| 1 | [TechChallenge-lambda-auth](https://github.com/RuannGodinho/TechChallenge-lambda-auth) | Lambdas JWT + API Gateway | Jest + Terraform |
| 3 | [TechChallenge-infra-db](https://github.com/RuannGodinho/TechChallenge-infra-db) | Terraform MongoDB Atlas M0 (opt-in) | Terraform |

## Ordem de deploy (após cutover)

1. Bootstrap S3 / EKS (`TechChallenge-infra-eks`) — publica `/techchallenge/eks/*` no SSM
2. (Opcional) Atlas (`TechChallenge-infra-db`) — publica `/techchallenge/db/mongodb_uri`
3. App neste repo — Docker Hub + `kubectl apply`
4. Lambda / API Gateway — lê `backend_url` no SSM

## Coexistência com o monorepo

Enquanto a `main` não receber esta branch:

- Produção continua no Terraform/CI do monorepo (`eks/terraform.tfstate`)
- Os repos novos usam keys `split/...` e **não devem** dar apply contra o state antigo
- Mongo permanece no cluster (`k8s/mongo/`) até `enable_managed_db=true`
