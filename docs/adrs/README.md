# ADRs — Architecture Decision Records

Decisões permanentes da **API** (este repositório). ADRs de nuvem, auth e banco canônicas nos repos irmãos.

## Neste repositório (API)

| ADR | Título | Status | RFC |
|---|---|---|---|
| [004](004-clean-architecture.md) | Organizamos a API em Clean Architecture | Aceita | [RFC-004](../rfcs/004-clean-architecture.md) |
| [005](005-monolito-modular.md) | Mantemos um monolito modular | Aceita | [RFC-005](../rfcs/005-monolito-modular.md) |
| [006](006-nodejs-typescript-express.md) | Implementamos a API em Node.js, TypeScript e Express | Aceita | [RFC-006](../rfcs/006-nodejs-typescript-express.md) |
| [009](009-quatro-repositorios.md) | Separamos a entrega em quatro repositórios | Aceita | [RFC-009](../rfcs/009-quatro-repositorios.md) |
| [011](011-cicd-docker-github-actions.md) | Entregamos a API com Docker Hub e GitHub Actions | Aceita | [RFC-011](../rfcs/011-cicd-docker-github-actions.md) |
| [012](012-hpa-observabilidade.md) | Escalamos por CPU e observamos o mínimo de laboratório | Aceita | [RFC-012](../rfcs/012-hpa-observabilidade.md) |
| [013](013-contrato-rest-swagger.md) | Exponos a oficina como API REST + OpenAPI (padrão de comunicação) | Aceita | [RFC-013](../rfcs/013-contrato-rest-swagger.md) |
| [014](014-smtp-orcamento.md) | Notificamos orçamento pendente por SMTP | Aceita | [RFC-014](../rfcs/014-smtp-orcamento.md) |
| [015](015-consulta-publica-os.md) | Permitimos consulta de OS por CPF/CNPJ sem JWT | Aceita | [RFC-015](../rfcs/015-consulta-publica-os.md) |
| [016](016-observabilidade-negocio.md) | Observamos as regras de OS com logs estruturados no New Relic | Aceita | [RFC-016](../rfcs/016-observabilidade-negocio.md) |

## Nos repositórios irmãos

| ADR | Título | Casa |
|---|---|---|
| [001](001-adocao-aws.md) | AWS | [infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/adrs/001-adocao-aws.md) |
| [002](002-mongodb-persistencia.md) | MongoDB | [infra-db](https://github.com/RuannGodinho/TechChallenge-infra-db/blob/main/docs/adrs/002-mongodb-persistencia.md) |
| [003](003-autenticacao-jwt-api-gateway.md) | JWT no Gateway | [lambda-auth](https://github.com/RuannGodinho/TechChallenge-lambda-auth/blob/main/docs/adrs/003-autenticacao-jwt-api-gateway.md) |
| [007](007-orquestracao-eks.md) | EKS | [infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/adrs/007-orquestracao-eks.md) |
| [008](008-nodeport-sem-alb.md) | NodePort | [infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/adrs/008-nodeport-sem-alb.md) |
| [010](010-terraform-iac.md) | Terraform | [infra-eks](https://github.com/RuannGodinho/TechChallenge-infra-eks/blob/main/docs/adrs/010-terraform-iac.md) |

## Relação com a arquitetura

- [RFCs deste repo](../rfcs/README.md)
- [Arquitetura (índice)](../ARQUITETURA.md)
- [Modelo de dados](../ARQUITETURA-MODELO-DADOS.md)
