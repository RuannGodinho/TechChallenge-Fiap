# Quatro repositórios

A entrega está em quatro GitHubs. Cada um carrega a documentação do **que ele provisiona ou executa**.

| # | Repositório | Código | Documentação canônica |
|---|---|---|---|
| 4 | [TechChallenge-Fiap](https://github.com/RuannGodinho/TechChallenge-Fiap) (este) | API Node, Dockerfile, `k8s/` | [docs/](.) — componentes, OS, ER, HPA, REST, Clean Architecture |
| 2 | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks) | Terraform VPC + EKS + SSM | [docs/](https://github.com/RuannGodinho/TechChallenge-infra-eks/tree/main/docs) — RFC/ADR 001, 007, 008, 010 |
| 1 | [TechChallenge-lambda-auth](https://github.com/RuannGodinho/TechChallenge-lambda-auth) | Lambdas JWT + API Gateway | [docs/](https://github.com/RuannGodinho/TechChallenge-lambda-auth/tree/main/docs) — sequência de auth, RFC/ADR 003 |
| 3 | [TechChallenge-infra-db](https://github.com/RuannGodinho/TechChallenge-infra-db) | Mongo no EKS (`k8s/`) + Atlas opt-in | [docs/](https://github.com/RuannGodinho/TechChallenge-infra-db/tree/main/docs) — RFC/ADR 002 |

Índice da solução (checklist do enunciado): [ARQUITETURA.md](ARQUITETURA.md).

## Ordem de deploy

1. Bootstrap S3 / EKS (`TechChallenge-infra-eks`) — publica `/techchallenge/eks/*` no SSM
2. Mongo no cluster (`TechChallenge-infra-db` CD `k8s/`) — `mongo-service:27017`
3. App neste repo — Docker Hub + `kubectl apply` da API (não sobe o banco)
4. Lambda / API Gateway — lê `backend_url` no SSM

## Coexistência com o monorepo

Enquanto a `main` não receber esta branch:

- Produção continua no Terraform/CI do monorepo (`eks/terraform.tfstate`)
- Os repos novos usam keys isoladas e **não devem** dar apply contra o state antigo
- Mongo no EKS é responsabilidade do TechChallenge-infra-db, não deste repo
