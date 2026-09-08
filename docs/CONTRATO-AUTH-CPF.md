# Contrato — autenticação por CPF

A Function Serverless (`TechChallenge-lambda-auth`) é quem emite o JWT em produção. Este repositório expõe o lookup do cliente no mesmo Mongo da oficina.

## Login (cliente)

```http
POST /api/login
{ "cpf": "81788455045" }
```

| Resultado | HTTP | Quando |
|---|---|---|
| `{ "token": "<jwt>" }` | 200 | CPF válido, cliente existe, `status = ATIVO` |
| `CPF inválido` / `CPF é obrigatório` | 400 | Documento ausente ou inválido |
| `Cliente não encontrado` | 401 | CPF válido sem cadastro |
| `Cliente inativo` | 403 | Cliente com `status = INATIVO` |
| Login só no Gateway | 410 | `AUTH_MODE=gateway` no pod |

Payload do JWT: `{ userId, cpf, email }` (HS256).

Seed para a demo: `81788455045` (ATIVO), `52263606068` (INATIVO).

## Lookup interno (Lambda → API)

Usado pela AuthSign quando o Mongo do laboratório não é alcançável da VPC da Lambda (`mongo-service`).

```http
GET /api/internal/auth/clientes/{cpf}
x-gateway-trust: <GATEWAY_TRUST_SECRET>
```

Resposta 200:

```json
{ "id": "...", "cpf": "81788455045", "email": "ruann@gmail.com", "nome": "Ruann Godinho", "status": "ATIVO" }
```

A Function valida o CPF, consulta esse contrato (ou o Mongo direto se `MONGODB_URI` for Atlas), recusa `INATIVO` e assina o JWT. O Authorizer devolve `userId`, `cpf` e `email`; o proxy injeta `x-user-id`, `x-user-cpf` e `x-user-email`.

## Homolog e produção

| Branch | Ambiente | Imagem |
|---|---|---|
| `release` | Homologação | `ruanngodinho/techchallenge:homolog` |
| `main` | Produção | `ruanngodinho/techchallenge:latest` |
