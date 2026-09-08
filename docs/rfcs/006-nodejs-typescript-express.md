# RFC – Stack da API: Node.js 20, TypeScript e Express

| Campo | Valor |
|---|---|
| **Número** | 006 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-006](../adrs/006-nodejs-typescript-express.md) |

## Resumo

Implementar a API em **Node.js 20** com **TypeScript** e **Express 4**, imagem `node:20-alpine`. A mesma stack cobre Compose, EKS e as Lambdas de auth (Node 20), reduzindo contexto mental no laboratório.

## Problema

A oficina precisa de uma API REST testável, com tipos no domínio (CPF, status de OS, IDs) e um runtime que rode igual no notebook e no pod. Linguagem e framework são decisões caras de reverter: definem Docker, CI, Lambdas e a curva do time.

Um backend sem tipos deixa value objects (documento, placa, status) só na documentação. Um framework pesado (Nest na vertical completa, Spring) estoura o tempo do challenge sem ganho de negócio.

## Proposta técnica

| Peça | Escolha | Papel |
|---|---|---|
| Runtime | Node.js 20 LTS | Compose, Dockerfile, Lambda |
| Linguagem | TypeScript 5 (`tsc --noEmit`) | Entidades, ports, use cases |
| HTTP | Express 4 | Rotas em `/api`, Swagger em `/docs` |
| Execução local | `tsx` | `npm start` / `dev` sem etapa de emit obrigatória |
| Testes | Jest + ts-jest + SuperTest | Unitário e HTTP |

A injeção de dependências é manual (`di-container.ts`), não um IoC de framework — alinhado à [RFC-004](004-clean-architecture.md).

Lambdas de auth também são Node 20, mas **não** compartilham o pacote da API: só o contrato JWT ([RFC-003](003-autenticacao-jwt-api-gateway.md)).

## Impacto esperado

**Ganhos**

- Um runtime do notebook ao authorizer.
- TypeScript documenta o domínio (VOs) e pega erro no CI (`build` = typecheck).
- Express é previsível para Swagger, middlewares `AUTH_MODE` e proxy do Gateway.
- Imagem Alpine pequena o bastante para push frequente no Docker Hub.

**Riscos e restrições**

- Express 4 é maduro, não é o mais rápido nem o mais “moderno” (Fastify). Suficiente para o volume de aula.
- `tsx` em produção no container evita `dist/`; o typecheck no CI é o que garante o binário.
- Dependências legadas do scaffold (`jade`, `morgan`) não fazem parte da arquitetura — ruído, não decisão.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **NestJS** | Clean Architecture “de fábrica”, porém acopla o domínio a decorators e ao próprio DI. O curso pede isolamento explícito. |
| **Fastify** | Melhor throughput. Ecossistema de Swagger/middleware e exemplos SAM/Express pesam mais neste recorte. |
| **Java / Spring Boot** | Forte em empresa; o repositório e o material do time já são Node. Trocar a linguagem não atende o produto. |
| **Python / FastAPI** | Idem: outro runtime nas Lambdas e no Dockerfile. |
| **JavaScript puro** | Mais rápido de escrever, mais frágil nos VOs e nos contratos de port. |

## Pontos em aberto

- Passar a publicar `dist/` compilado na imagem (em vez de `tsx` no `CMD`) para cold start e auditoria.
- Remover dependências do generator Express que não são usadas pelas rotas `/api`.
