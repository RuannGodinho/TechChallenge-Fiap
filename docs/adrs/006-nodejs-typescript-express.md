# ADR – Implementamos a API em Node.js, TypeScript e Express

| Campo | Valor |
|---|---|
| **Número** | 006 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-006](../rfcs/006-nodejs-typescript-express.md) |

## Contexto

Precisamos de API REST tipada (documento, status, IDs) com o mesmo runtime no notebook, no pod e nas Lambdas de auth. Trocar de linguagem no meio do challenge duplica Docker, CI e authorizer.

## Decisão

Implementamos a API em **Node.js 20 LTS**, **TypeScript 5** e **Express 4**, imagem `node:20-alpine`. O CI typechecka (`tsc --noEmit`); local e container usam `tsx`. A injeção de dependências é manual (`di-container.ts`), não um IoC de framework. As Lambdas também são Node 20, sem compartilhar o pacote da API — só o contrato JWT.

## Consequências

Um runtime cobre o laboratório. Value objects ganham checagem no CI. Express encaixa Swagger e os middlewares de `AUTH_MODE`. Aceitamos throughput inferior ao de Fastify e o fato de o container executar TypeScript via `tsx` em vez de `dist/` compilado. Dependências do scaffold Express que não servem `/api` são ruído a limpar.

## Alternativas

Descartamos NestJS para não acoplar o domínio a decorators. Descartamos Fastify apesar do desempenho. Descartamos Java/Spring e Python/FastAPI por ruptura de stack. Descartamos JavaScript puro pela fragilidade dos VOs.
