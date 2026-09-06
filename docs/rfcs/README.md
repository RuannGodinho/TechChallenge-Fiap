# RFCs — Request for Comments

Propostas técnicas da **API** (este repositório). RFCs de nuvem, auth e banco canônicas nos repos irmãos; aqui ficam ponteiros com o mesmo número.

Formato da aula *Propostas Arquiteturais com RFCs e ADRs* (14SOAT — Fase 1 — Aula 4). Template: [`000-template.md`](000-template.md).

## Neste repositório (API)

| RFC | Título | Status |
|---|---|---|
| [004](004-clean-architecture.md) | Clean Architecture nas camadas da API | Encerrada – Aprovada |
| [005](005-monolito-modular.md) | Monolito modular em vez de microsserviços | Encerrada – Aprovada |
| [006](006-nodejs-typescript-express.md) | Stack Node.js 20, TypeScript e Express | Encerrada – Aprovada |
| [009](009-quatro-repositorios.md) | Separação em quatro repositórios | Encerrada – Aprovada |
| [011](011-cicd-docker-github-actions.md) | Entrega contínua: Docker Hub e GitHub Actions | Encerrada – Aprovada |
| [012](012-hpa-observabilidade.md) | Autoscaling por CPU e observabilidade de laboratório | Encerrada – Aprovada |
| [013](013-contrato-rest-swagger.md) | Contrato HTTP REST com OpenAPI/Swagger (padrão de comunicação) | Encerrada – Aprovada |
| [014](014-smtp-orcamento.md) | Notificação de orçamento por SMTP | Encerrada – Aprovada |
| [015](015-consulta-publica-os.md) | Consulta pública de OS por CPF/CNPJ | Encerrada – Aprovada |
| [016](016-observabilidade-negocio.md) | Observabilidade de regras de negócio via logs e New Relic | Encerrada – Aprovada |

## Nos repositórios irmãos

| RFC | Título | Casa |
|---|---|---|
| [001](001-adocao-aws.md) | Adoção da AWS | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/rfcs/001-adocao-aws.md) |
| [002](002-mongodb-persistencia.md) | MongoDB / Atlas | [TechChallenge-infra-db](https://github.com/RuannGodinho/TechChallenge-infra-db/blob/main/docs/rfcs/002-mongodb-persistencia.md) |
| [003](003-autenticacao-jwt-api-gateway.md) | JWT no API Gateway | [TechChallenge-lambda-auth](https://github.com/RuannGodinho/TechChallenge-lambda-auth/blob/main/docs/rfcs/003-autenticacao-jwt-api-gateway.md) |
| [007](007-orquestracao-eks.md) | Orquestração EKS | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/rfcs/007-orquestracao-eks.md) |
| [008](008-nodeport-sem-alb.md) | NodePort sem ALB | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/rfcs/008-nodeport-sem-alb.md) |
| [010](010-terraform-iac.md) | Terraform | [TechChallenge-infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/rfcs/010-terraform-iac.md) |

Os arquivos `001`, `002`, `003`, `007`, `008` e `010` neste pasta são **ponteiros** para o texto canônico.

## Relação com a arquitetura

- [ADRs deste repo](../adrs/README.md)
- [Arquitetura (índice)](../ARQUITETURA.md)
- [Mapa dos quatro repos](../REPOS.md)
