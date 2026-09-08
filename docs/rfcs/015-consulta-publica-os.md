# RFC – Consulta pública de OS por CPF/CNPJ

| Campo | Valor |
|---|---|
| **Número** | 015 |
| **Data** | 21/08/2026 |
| **Autor** | Ruann Correa Godinho |
| **Status** | Encerrada – Aprovada |
| **ADR** | [ADR-015](../adrs/015-consulta-publica-os.md) |

## Resumo

Manter `GET /api/ordensServico/:cpfCnpj/detalhes` **sem JWT** no API Gateway (authorizer `NONE`), para o dono do veículo acompanhar a OS. Demais rotas de OS continuam autenticadas. É exceção de produto, não buraco acidental na [RFC-003](003-autenticacao-jwt-api-gateway.md).

## Problema

O operador da oficina tem login (`AUTH_EMAIL`). O cliente final da oficina **não** tem usuário no sistema. Se toda leitura de OS exigir Bearer, o cliente não consulta status sem receber o JWT do operador (inaceitável) ou sem um segundo IdP (fora do escopo).

Um endpoint público que liste *todas* as OS seria vazamento. O recorte é: quem conhece o documento consulta os detalhes daquele cliente.

## Proposta técnica

- Path: `GET /api/ordensServico/:cpfCnpj/detalhes`.
- Gateway: mesma rota sem Authorizer (como `/api/login` e `/docs`).
- API: **não** exige `x-gateway-trust` / `req.user` neste handler.
- Filtro obrigatório pelo documento do path — não existe `GET` público de listagem geral.
- Identificador é CPF/CNPJ já usado no cadastro (`Documento` VO), não um token mágico por OS.

Operadores continuam usando `GET /api/ordensServico` e `GET /api/ordensServico/:id` com JWT.

## Impacto esperado

**Ganhos**

- Demo do “cliente acompanha a OS” sem inventar login de consumidor.
- Superfície explícita: uma rota, um parâmetro.

**Riscos e restrições**

- CPF/CNPJ não é segredo. Enumeração (tentar documentos) pode vazar existência de atendimento, peças e valores.
- Sem captcha, rate limit nem token de consulta de uso único.
- Logs do Gateway não identificam o consultante (não há `userId`).
- Inadequado para LGPD em produção sem mitigação (OTP, token enviado por SMS/e-mail, mascaramento).

## Alternativas consideradas

| Alternativa | Por que foi descartada |
|---|---|
| **JWT também nesta rota** | Cliente final sem credencial; forçaria compartilhar o usuário mock. |
| **Token opaco por OS** (link mágico no e-mail) | Melhor privacidade. Exige persistir token, TTL e o SMTP da [RFC-014](014-smtp-orcamento.md) na abertura da OS — ainda não há esse fluxo. |
| **Portal separado + Cognito de clientes** | Segundo produto. Fora do monolito de laboratório. |
| **Não expor leitura ao cliente** | Mais seguro; perde o caso de uso de acompanhamento. |
| **Listagem pública paginada** | Vazamento amplo; rejeitada. |

## Pontos em aberto

- Rate limit no Gateway ou WAF nesta rota.
- Mascarar valores e peças na resposta pública (mostrar só status e prazo).
- Evoluir para link mágico no e-mail do orçamento, depreciando a consulta só por CPF.
- Índice Mongo no documento para não fazer collection scan ([RFC-002](002-mongodb-persistencia.md)).
