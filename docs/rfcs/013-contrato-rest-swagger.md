# RFC – Contrato HTTP REST com OpenAPI/Swagger

| Campo | Valor |
|---|---|
| **Número** | 013 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-013](../adrs/013-contrato-rest-swagger.md) |

## Resumo

Adotar **REST síncrono sobre HTTP** como padrão de comunicação da oficina: recursos sob `/api`, documentados em **OpenAPI** via `swagger-jsdoc` + `swagger-ui-express` em `/docs` (JSON em `/swagger.json`). O Swagger é público no Gateway; as operações de negócio (exceto consulta por documento) exigem JWT.

## Problema

Operadores, banca e o próprio time precisam exercitar clientes, OS e estoque sem ler o código. Sem contrato visível, o API Gateway e o Express divergem de path (`/api/login` vs `/login`). GraphQL ou gRPC exigiriam outro client e outro authorizer.

## Proposta técnica

- Prefixo único `/api` montado em `app.ts`.
- Recursos por substantivo no plural (`/clientes`, `/veiculos`, `/ordensServico`, …) com verbos HTTP.
- Documentação gerada das anotações JSDoc → UI em `/docs`.
- Gateway replica os paths: login, rotas JWT, Swagger e a consulta pública ([RFC-015](015-consulta-publica-os.md)).
- Sem versionamento de URL (`/v1`) nesta fase: um contrato, um deploy ([RFC-005](005-monolito-modular.md)).

## Impacto esperado

**Ganhos**

- Banca e Postman usam `/docs` como fonte.
- Paths estáveis para o mapeamento do HTTP API.
- REST casa com JWT Bearer e com o proxy do Gateway.

**Riscos e restrições**

- Swagger público revela o formato das OS e dos erros — aceitável em lab, não em API confidencial.
- JSDoc pode ficar defasado da implementação se o CI não falhar em drift.
- Sem `/v1`, breaking change é breaking change.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **GraphQL** | Um endpoint, queries flexíveis. Authorizer, cache e o CRUD da oficina ficam mais complexos sem consumidor BFF. |
| **gRPC** | Forte internamente. Ruim para Swagger, browser e API Gateway HTTP API deste desenho. |
| **OpenAPI primeiro** (spec YAML, código gerado) | Contrato mais rígido. O ritmo do MVP é code-first com anotações. |
| **Só Postman collection** | Não versiona com o repo nem aparece em `/docs`. |

## Pontos em aberto

- Checagem no CI de que as rotas Express ⊆ paths do OpenAPI.
- Introduzir `/v1` no primeiro breaking change (ex.: OS sem peças aninhadas).
- Proteger `/docs` com o mesmo JWT se a demo sair de laboratório.
