# Patch — TechChallenge-lambda-auth (login por CPF)

Aplicar neste repositório irmão: https://github.com/RuannGodinho/TechChallenge-lambda-auth

## 1. `auth/sign/handler.js`

Substituir pelo arquivo `sign-handler.js` desta pasta (renomear para `handler.js`).

A Function:

1. Valida o CPF (`cpf-cnpj-validator`)
2. Consulta `GET {BACKEND_URL}/api/internal/auth/clientes/{cpf}` com `x-gateway-trust`
3. Recusa 404 (não existe) e `status !== ATIVO`
4. Assina JWT `{ userId, cpf, email }`

## 2. `auth/shared/config.js`

Trocar `authEmail` / `authPassword` por:

```js
backendUrl: process.env.BACKEND_URL || 'http://host.docker.internal:3000',
gatewayTrustSecret: process.env.GATEWAY_TRUST_SECRET || (allowDevDefaults ? 'local-trust' : requireEnv('GATEWAY_TRUST_SECRET')),
```

`JWT_SECRET` continua obrigatório.

## 3. `auth/authorizer/handler.js`

No context autorizado, incluir `cpf`:

```js
context: {
  userId: String(payload.userId),
  cpf: String(payload.cpf),
  email: String(payload.email),
}
```

## 4. `auth/backend-proxy/handler.js`

Encaminhar `x-user-cpf` a partir de `authorizer.cpf`. Incluir `x-user-cpf` em `STRIPPED_HEADERS`.

## 5. `terraform/api-gateway.tf`

Na integration `eks_proxy`, adicionar:

```hcl
"overwrite:header.X-User-Cpf" = "$context.authorizer.cpf"
```

## 6. `terraform/lambda-auth.tf`

Env da AuthSign/Authorizer:

```hcl
JWT_SECRET            = var.jwt_secret
JWT_EXPIRES_IN        = var.jwt_expires_in
BACKEND_URL           = local.eks_backend_url
GATEWAY_TRUST_SECRET  = var.gateway_trust_secret
```

Remover `AUTH_EMAIL` / `AUTH_PASSWORD` do env e do `precondition`.

## 7. Dependência

Em `auth/package.json`:

```json
"cpf-cnpj-validator": "^1.0.3"
```

Rodar `npm install` em `auth/`.

## 8. Evento SAM

`auth/events/login-event.json` body:

```json
{ "cpf": "81788455045" }
```

## 9. Testes Jest

Login com CPF ativo do seed, 403 para `52263606068`, 401 para CPF sem cadastro. Mockar o lookup HTTP.

Contrato da API: [CONTRATO-AUTH-CPF.md](../CONTRATO-AUTH-CPF.md).
