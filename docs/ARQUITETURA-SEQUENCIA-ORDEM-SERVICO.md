# Diagrama de Sequência — Abertura de ordem de serviço

Fluxo autenticado de `POST /api/ordensServico` na solução **Node-Fiap**.

Pré-condição: o operador já possui JWT ([sequência de autenticação](ARQUITETURA-SEQUENCIA-AUTENTICACAO.md)). Cliente e veículo devem existir no MongoDB ([modelo de dados](ARQUITETURA-MODELO-DADOS.md)).

Índice da arquitetura: [ARQUITETURA.md](ARQUITETURA.md). Componentes: [ARQUITETURA-COMPONENTES.md](ARQUITETURA-COMPONENTES.md).

| O que o enunciado pede | Neste documento |
|---|---|
| Sequência da abertura de OS | Diagrama 1 (caminho feliz) e diagrama 2 (validações e persistência) |

---

## Diagrama 1 — caminho feliz

Visão ponta a ponta, sem os ramos de erro. O operador já autenticou ([sequência de autenticação](ARQUITETURA-SEQUENCIA-AUTENTICACAO.md)).

```mermaid
sequenceDiagram
  autonumber
  actor Operador
  participant GW as API Gateway
  participant AuthZ as Lambda Authorizer
  participant API as Express EKS
  participant UC as CriarOrdemServicoUseCase
  participant DB as MongoDB

  Operador->>GW: POST /api/ordensServico<br/>Bearer JWT<br/>{ cpfCnpj, veiculoId, pecas[], servicos[] }
  GW->>AuthZ: Valida JWT
  AuthZ-->>GW: isAuthorized + userId, email
  GW->>API: proxy + x-user-* + x-gateway-trust
  API->>UC: execute
  UC->>DB: Cliente existe? Veiculo existe?
  DB-->>UC: sim
  UC->>UC: OrdemServico.create status RECEBIDA
  UC->>DB: insertOne OrdemServico
  opt servicos informados
    UC->>DB: insertMany ExecucoesServico
  end
  API-->>GW: 201 JSON da OS
  GW-->>Operador: 201
```

A OS nasce como agregado: um documento com `cpfCnpj`, `veiculo`, `pecas[]` e `servicos[]` — sem JOIN. Detalhe do modelo: [ARQUITETURA-MODELO-DADOS.md](ARQUITETURA-MODELO-DADOS.md).

---

## Diagrama 2 — validações e persistência

```mermaid
sequenceDiagram
  autonumber
  actor Cliente
  participant GW as API Gateway
  participant AuthZ as Lambda Authorizer
  participant API as Express / Rotas
  participant MW as gatewayUserMiddleware
  participant Ctrl as OrdemServicoController
  participant UC as CriarOrdemServicoUseCase
  participant CliGW as ClienteLookup
  participant VeiGW as VeiculoLookup
  participant OSGW as OrdemServicoMongoGateway
  participant ExecUC as CriarExecucoesParaServicos
  participant DB as MongoDB

  Cliente->>GW: POST /api/ordensServico<br/>Bearer JWT<br/>{ cpfCnpj, veiculoId, pecas[], servicos[] }
  GW->>AuthZ: Valida JWT

  alt Token inválido ou ausente
    AuthZ-->>GW: isAuthorized false
    GW-->>Cliente: 401
  else Token válido
    AuthZ-->>GW: userId, email
    GW->>API: POST /api/ordensServico<br/>x-user-id, x-user-email, x-gateway-trust
    API->>MW: authMiddleware modo gateway

    alt x-gateway-trust inválido ou identidade ausente
      MW-->>Cliente: 401 Token não informado
    else Confiança OK
      MW->>API: req.user preenchido
      API->>API: Valida cpfCnpj e veiculoId

      alt Campos obrigatórios ausentes
        API-->>Cliente: 400 Cliente e veículo são obrigatórios
      else Payload válido
        API->>Ctrl: createOrdemServico
        Ctrl->>UC: execute

        UC->>UC: OrdemServico.create status RECEBIDA
        UC->>CliGW: existsByCpf(cpfCnpj)
        CliGW->>DB: find Cliente
        DB-->>CliGW: existe?

        alt Cliente inexistente
          UC-->>Cliente: 500 Cliente não encontrado para o CPF/CNPJ fornecido
        else Cliente existe
          UC->>VeiGW: existsById(veiculoId)
          VeiGW->>DB: find Veiculo
          DB-->>VeiGW: existe?

          alt Veículo inexistente
            UC-->>Cliente: 500 Veículo não encontrado para o ID fornecido
          else Veículo existe
            UC->>OSGW: save(ordem)
            OSGW->>DB: insertOne OrdemServico
            DB-->>OSGW: _id gerado

            opt servicos.length > 0
              UC->>ExecUC: createExecucoesParaServicos
              ExecUC->>DB: find Servico por id
              ExecUC->>DB: saveMany ExecucaoServico
            end

            UC-->>Ctrl: OrdemServico persistida
            Ctrl->>Ctrl: Presenter
            Ctrl-->>API: DTO
            API-->>GW: 201 JSON da OS
            GW-->>Cliente: 201
          end
        end
      end
    end
  end
```

---

## Regras de abertura

| Regra | Comportamento |
|---|---|
| Autenticação | JWT obrigatório (rota com `authMiddleware`) |
| Entrada mínima | `cpfCnpj` e `veiculoId` (alias `veiculo`) |
| Status inicial | `RECEBIDA` (`StatusOS.recebida()`) |
| `dataAbertura` | `new Date()` no momento da criação |
| Cliente | Deve existir no banco para o CPF/CNPJ |
| Veículo | Deve existir para o `veiculoId` |
| Peças | Opcional; cada item vira `OrdemPecaItem` |
| Serviços | Opcional; IDs deduplicados; cada um gera `ExecucaoServico` |
| Persistência | `insertOne` na coleção `OrdemServico` |
| Resposta | `201` com id, status, peças, serviços e `valorTotal` |

Ciclo de vida da OS após a abertura:

```text
RECEBIDA → EM DIAGNOSTICO → AGUARDANDO APROVACAO → EM EXECUCAO → FINALIZADA → ENTREGUE
```

A consulta `GET /api/ordensServico/:cpfCnpj/detalhes` é pública no Gateway (authorizer `NONE`), para o cliente da oficina acompanhar a OS sem JWT de operador.

---

## Documentação relacionada

- [Arquitetura (índice)](ARQUITETURA.md)
- [Diagrama de Componentes](ARQUITETURA-COMPONENTES.md)
- [Modelo de dados — ER e justificativa](ARQUITETURA-MODELO-DADOS.md)
- [Sequência — Autenticação](ARQUITETURA-SEQUENCIA-AUTENTICACAO.md)
