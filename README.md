# Node-Fiap

API backend para gestão de oficinas mecânicas, permitindo controlar clientes, veículos, ordens de serviço, estoque e orçamentos.

## Visão Geral

Desenvolvida com Node.js, TypeScript, MongoDB e Docker, aplicando **Clean Architecture** , segurança e testes automatizados.
A aplicação expõe rotas REST em `/api` e documentação Swagger em `/docs`.

## Stack

Node.js • TypeScript • Express • MongoDB • Docker • JWT • Jest • Swagger • Clean Architecture

## Requisitos

- Docker
- Docker Compose
- Node.js 20.x (para execução local sem Docker)
- npm 10.x ou superior

## Estrutura principal

- `app.ts` - instancia o Express e monta as rotas
- `src/main/server.ts` - inicia o servidor e expõe Swagger
- `src/infrastructure/composition-root/di-container.ts` - injeção de dependências
- `docker-compose.yml` - compose para MongoDB + API
- `Dockerfile` - imagem Node.js para a API
- `mongo-init/` - scripts de inicialização do MongoDB
- `k8s/` - manifests Kubernetes da API e do Mongo in-cluster
- Infra EKS, Lambda e banco gerenciado: ver [docs/REPOS.md](docs/REPOS.md)

## Variáveis de ambiente

As variáveis usadas pela aplicação são:

- `MONGODB_URI` - string de conexão com MongoDB
- `PORT` - porta onde a API irá rodar (default `3000`)
- `NODE_ENV` - ambiente da aplicação
- `JWT_SECRET` - segredo JWT
- `JWT_EXPIRES_IN` - tempo de expiração do token JWT (default `1h`)
- `AUTH_EMAIL` - e-mail do usuário padrão
- `AUTH_PASSWORD` - senha do usuário padrão
- `SMTP_HOST` - host SMTP (obrigatório)
- `SMTP_PORT` - porta SMTP (obrigatório)
- `SMTP_USER` - usuário SMTP para envio de e-mails (obrigatório)
- `SMTP_PASS` - senha ou app password SMTP (obrigatório)
- `SMTP_FROM` - remetente (opcional; default: `SMTP_USER`)
- `SMTP_SECURE` - `true` para TLS na porta 465 (opcional)
- `ORCAMENTO_EMAIL_TO` - destinatário do orçamento (obrigatório)

> Configure todas as variáveis SMTP no `.env`. O compose carrega o arquivo via `env_file`.

## E-mail de orçamento (SMTP)

Ao criar um orçamento pendente, a API envia um e-mail via SMTP com o resumo (peças, serviços, valor total e validade). O destinatário é definido por `ORCAMENTO_EMAIL_TO`. As credenciais SMTP vêm das variáveis `SMTP_*` no `.env`.

> No Docker Compose, o container da API já define `PORT`, `MONGO_URL` e `NODE_ENV`.

## Executando do zero com Docker

1. Garanta que Docker e Docker Compose estão instalados.
2. No diretório do projeto, execute:

```bash
docker compose up -d --build
```

3. Verifique o status dos containers:

```bash
docker compose ps
```

4. Acesse a API em:

- `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

5. Para parar os containers:

```bash
docker compose down
```

6. Para reconstruir tudo após mudança no Dockerfile ou dependências:

```bash
docker compose up -d --build --force-recreate
```

## Rodando testes

```bash
npm test
```

### Cobertura

```bash
npm run coverage
```

## Principais Recursos

- Autenticação JWT
- CRUD de Clientes
- Gestão de Veículos
- Controle de Estoque
- Ordem de Serviço
- Aprovação de Orçamentos
- Envio de orçamento por e-mail (SMTP)

A API monta todas as rotas sob o prefixo `/api`.

Consulte `/docs` para referência completa.

## Segurança

- JWT Authentication
- Variáveis sensíveis por ambiente
- Testes com OWASP ZAP
- Validação de entrada

## Documentação Swagger

A documentação da API fica disponível em:

```text
http://localhost:3000/docs
```

Ou diretamente o JSON do Swagger em:

```text
http://localhost:3000/swagger.json
```

## Qualidade

- Jest unit tests
- Cobertura de testes


## Observações

- A configuração de banco local usa a variável `MONGODB_URI`.
- Quando rodar por Docker Compose, a aplicação usa o serviço `mongodb` do compose.
- O seed local roda apenas no Docker Compose (`command` do serviço `api`). No Kubernetes, use o Job em `k8s/api-seed-job.yml`.

## Comandos úteis

- Subir containers: `docker compose up -d --build`
- Parar containers: `docker compose down`
- Ver logs do container da API: `docker compose logs -f api`
- Ver logs do MongoDB: `docker compose logs -f mongodb`


## Justificativa da Escolha do Banco de Dados: MongoDB
Para este projeto, optamos pelo MongoDB como solução de persistência de dados. Abaixo, detalhamos os motivos técnicos que sustentam essa decisão baseada nas necessidades da oficina:

## Modelagem Orientada a Documentos e DDD
A Ordem de Serviço (OS) é um exemplo clássico de um Agregado complexo no Domain-Driven Design. No MongoDB, podemos armazenar a OS como um documento único que contém:

- Dados do veículo e do cliente (ou referências).

- Uma lista aninhada de serviços realizados.

- Uma lista aninhada de peças utilizadas.

- Histórico de mudanças de status.

Essa estrutura evita múltiplos JOINs complexos (comuns em bancos relacionais), permitindo que todo o contexto da OS seja recuperado em uma única consulta, o que acelera o tempo de resposta da API para o cliente final.

## Flexibilidade de Esquema (Schema-less)
Sendo um sistema em estágio de MVP, o fluxo da oficina pode evoluir rapidamente. Hoje, uma peça tem "nome e preço"; amanhã, pode precisar de "número de série, lote e validade da garantia".

O MongoDB permite que o esquema evolua sem a necessidade de migrações de banco de dados (migrations) pesadas que poderiam causar downtime no atendimento da oficina.

## Variabilidade dos Dados de Atendimento
Cada atendimento na oficina é único:

Uma troca de óleo é simples e possui poucos dados.

Uma retífica de motor pode envolver dezenas de peças e sub-serviços.
O modelo de documentos do MongoDB lida nativamente com essa variabilidade, armazenando apenas os campos necessários para cada registro, otimizando o armazenamento.

---

## Infraestrutura, Kubernetes e Deploy (Tech Challenge)

| Documento | Conteúdo |
|---|---|
| [Arquitetura](docs/ARQUITETURA.md) | Visão da solução, diagrama de deploy, componentes e fluxo ponta a ponta |
| [Quatro repositórios](docs/REPOS.md) | Split Lambda / EKS / DB / app (esta branch) |
| [Kubernetes](docs/KUBERNETES.md) | Workloads no EKS, manifests, deploy manual e acesso |
| [Terraform](docs/TERRAFORM.md) | Ponte para os repos de infraestrutura |
| [GitHub Actions](docs/GITHUB-ACTIONS.md) | CI/CD da API neste repositório |


