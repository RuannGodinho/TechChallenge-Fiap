# ADR – Organizamos a API em Clean Architecture

| Campo | Valor |
|---|---|
| **Número** | 004 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-004](../rfcs/004-clean-architecture.md) |

## Contexto

HTTP, JWT, Mongo, SMTP e AWS mudam no mesmo prazo do challenge. Se a regra da OS viver em `req`/`res` ou no driver, cada cutover vira reescrita. O time precisa testar o negócio sem subir a nuvem.

## Decisão

Organizamos o código em **Clean Architecture**: Enterprise (`src/enterprise`), Application (`src/application`), Adapters (`src/Adapters`) e Infrastructure (`src/infrastructure`). As dependências apontam para dentro. Casos de uso falam com **ports**; gateways Mongo, Nodemailer e JWT implementam essas ports. `AUTH_MODE` permanece na infrastructure.

## Consequências

Trocamos Atlas, Gateway e SMTP sem alterar entidades. Testamos use cases isolados. O custo é mais arquivos e o risco de vazar `Request` ou `ObjectId` para o domínio. A pasta `Adapters` exige disciplina de fronteira com `infrastructure`.

## Alternativas

Descartamos MVC clássico com model Mongoose no centro. Tratamos hexagonal como equivalente; escolhemos o vocabulário Clean Architecture do curso. Adiamos vertical slices: o núcleo é a OS, não dezenas de produtos.
