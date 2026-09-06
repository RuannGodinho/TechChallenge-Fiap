# ADR – Exponos a oficina como API REST + OpenAPI

Padrão de comunicação permanente da solução: **REST síncrono** sobre HTTP, contrato OpenAPI.

| Campo | Valor |
|---|---|
| **Número** | 013 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-013](../rfcs/013-contrato-rest-swagger.md) |

## Contexto

Banca, operadores e o Gateway precisam dos mesmos paths. Sem contrato visível, `/api/login` e as rotas JWT divergem. GraphQL ou gRPC exigiriam outro client e outro authorizer. Versionar `/v1` cedo não tem consumidor paralelo.

## Decisão

Exponos a oficina como **API REST** sob o prefixo `/api`, documentada em **OpenAPI** (`swagger-jsdoc` + UI em `/docs`, JSON em `/swagger.json`). O Swagger é público no Gateway. Não versionamos a URL nesta fase. Recursos seguem substantivos no plural e verbos HTTP.

## Consequências

`/docs` vira a fonte da demo e ancora o mapeamento do HTTP API. JSDoc pode atrasar em relação ao código. Swagger público revela o formato das OS. Breaking change quebra clientes sem `/v1`.

## Alternativas

Descartamos GraphQL e gRPC neste recorte. Descartamos OpenAPI-first com código gerado. Descartamos coleção Postman como único contrato.
