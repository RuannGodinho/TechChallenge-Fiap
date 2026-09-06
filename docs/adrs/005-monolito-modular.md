# ADR – Mantemos um monolito modular

| Campo | Valor |
|---|---|
| **Número** | 005 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-005](../rfcs/005-monolito-modular.md) |

## Contexto

Cliente, veículo, peças e OS compartilham o atendimento. Microsserviços agora imporiam rede, sagas e vários pipelines a um laboratório de uma pessoa. Um único arquivo de rotas, porém, impediria extração futura.

## Decisão

Mantemos **um deployable**: um Deployment, um Service, um banco. Modularizamos por agregado (cliente, veículo, OS, estoque, orçamento) com chamada in-process. A única peça fora do processo de negócio é a **borda de autenticação** ([ADR-003](003-autenticacao-jwt-api-gateway.md)). Escalamos réplicas do mesmo binário, não serviços distintos.

## Consequências

Simplificamos deploy, transação da OS e onboarding. Um defeito no processo pode derrubar todos os módulos juntos (o login de produção já está na Lambda). O HPA escala a API inteira, inclusive rotas leves. Extração futura de um módulo continua possível pelas pastas e ports.

## Alternativas

Descartamos microsserviços por custo e acoplamento da OS. Descartamos monolito com bancos separados. Descartamos uma Lambda por rota e CQRS prematuro (read/write split).
