# RFC – Monolito modular em vez de microsserviços

| Campo | Valor |
|---|---|
| **Número** | 005 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-005](../adrs/005-monolito-modular.md) |

## Resumo

Manter a oficina como **um único deployable** (API Express + um banco `Node-Fiap`), modularizado por domínio (cliente, veículo, OS, estoque, orçamento). Auth na borda é serviço à parte; não fragmentar o negócio em microsserviços nesta fase.

## Problema

Clientes, veículos, peças e OS compartilham o mesmo fluxo de atendimento. Fatiar agora em “serviço de cliente”, “serviço de OS” e “serviço de estoque” exigiria rede, contratos versionados, sagas e vários pipelines — para um laboratório com um operador e um cluster pequeno.

Ao mesmo tempo, um “big ball of mud” (todas as regras nas rotas) impede extração futura. O desenho precisa ser **um processo, vários módulos**.

## Proposta técnica

- **Um** Deployment `api-deployment`, **um** Service `api-service`, **um** banco.
- Módulos internos: rotas e use cases por agregado (`cliente`, `veiculo`, `ordem-servico`, `estoque`, `orcamento`, `execucao-servico`).
- Comunicação entre módulos = chamada in-process (use case → port), não HTTP interno.
- Exceção consciente: **login/authorizer** saem do monolito ([RFC-003](003-autenticacao-jwt-api-gateway.md)) porque são borda/NFR, não bounded context de oficina.
- Escalamos **réplicas do mesmo binário** (HPA), não serviços independentes.

```text
[ API Gateway + Lambdas ]     ← borda, não domínio
         |
[ api-deployment  × 1–4 ]     ← monolito modular
         |
[ Mongo Node-Fiap ]
```

## Impacto esperado

**Ganhos**

- Deploy único (`kubectl apply` + uma imagem Docker Hub).
- Transação de abertura de OS permanece no mesmo processo e no mesmo banco.
- Módulos + Clean Architecture deixam um caminho de extração (ex.: estoque) se o volume justificar.

**Riscos e restrições**

- O binário cresce; um bug em peças pode derrubar login local e OS juntos (no EKS o login já está na Lambda).
- Times paralelos no mesmo repo sofrem conflito de merge — mitigado em parte pelo split de infra ([RFC-009](009-quatro-repositorios.md)).
- HPA escala tudo junto: carga em `GET /docs` sobe também o worker de OS.

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **Microsserviços** (OS, estoque, cadastro) | Escopo da aula e custo de EKS não pagam service mesh, tracing distribuído e consistência entre bases. A OS *é* o acoplamento. |
| **Modular monolith + bancos separados** | Pior dos dois mundos: um deploy e distributed data. |
| **Serverless por use case** (uma Lambda por rota) | Fria, timeouts e perda do modelo de domínio rico; o Express já cobre o CRUD. |
| **Dois monolitos** (read vs write) | CQRS prematuro; a consulta pública de OS lê o mesmo agregado da escrita. |

## Pontos em aberto

- Sinal para extrair um módulo (ex.: estoque com outro SLA) — latência, taxa de deploy ou time dedicado.
- Se o monolito crescer, limitar o HPA a rotas pesadas via segundo Deployment ainda compartilhando a mesma imagem.
