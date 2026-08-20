# Provisionamento com Terraform

A infraestrutura AWS **não vive mais neste repositório** (branch `feat/split-four-repos`).

| Stack | Repositório |
|---|---|
| VPC, EKS, nodes, EBS CSI, bootstrap S3, SSM `/techchallenge/eks/*` | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks) |
| Lambdas JWT + API Gateway | [TechChallenge-lambda-auth](https://github.com/RuannGodinho/TechChallenge-lambda-auth) |
| MongoDB Atlas M0 (opt-in) | [TechChallenge-infra-db](https://github.com/RuannGodinho/TechChallenge-infra-db) |

Workloads da aplicação (API, Mongo in-cluster, HPA) continuam em `k8s/` e são aplicados pelo CD deste repo.

Enquanto a `main` do monorepo não receber esta branch, o cluster de laboratório ainda é o Terraform antigo em `eks/terraform.tfstate`. Os repos novos usam keys `split/...` e não devem aplicar contra o state de produção. Ver [REPOS.md](REPOS.md).
