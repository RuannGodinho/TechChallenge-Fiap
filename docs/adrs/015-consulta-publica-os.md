# ADR – Permitimos consulta de OS por CPF/CNPJ sem JWT

| Campo | Valor |
|---|---|
| **Número** | 015 |
| **Data** | 21/08/2026 |
| **Dono** | Ruann Correa Godinho |
| **Status** | Aceita |
| **RFC de origem** | [RFC-015](../rfcs/015-consulta-publica-os.md) |

## Contexto

O operador tem `AUTH_EMAIL`. O cliente da oficina não tem usuário. Exigir Bearer em toda leitura de OS ou compartilha o JWT do operador ou exige um segundo IdP. Listar todas as OS em público vazaria a oficina.

## Decisão

Mantemos `GET /api/ordensServico/:cpfCnpj/detalhes` **sem JWT** (authorizer `NONE` no Gateway). A rota filtra pelo documento do path; não existe listagem pública geral. Demais rotas de OS continuam autenticadas. Trata-se de exceção de produto, não de falha da [ADR-003](003-autenticacao-jwt-api-gateway.md).

## Consequências

A demo “cliente acompanha a OS” funciona sem login de consumidor. CPF/CNPJ não é segredo: enumeração pode vazar existência de atendimento e valores. Não há rate limit, captcha nem token de uso único. Em produção comercial isso seria inadequado à LGPD sem mitigação.

## Alternativas

Descartamos JWT nesta rota, portal Cognito de clientes e listagem pública paginada. Adiamos link mágico por e-mail (melhor privacidade, fluxo ainda inexistente). Descartamos não expor leitura ao cliente, porque perde o caso de acompanhamento.
