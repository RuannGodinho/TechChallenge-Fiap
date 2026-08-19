# Provisionamento com Terraform

Provisionamento da **infraestrutura AWS** com Terraform: bootstrap do state, cluster EKS e recursos de rede/IAM. **Não** aplica workloads da aplicação — isso é feito pelo CD ou `kubectl`.

## Estrutura no repositório

```text
infra/
├── terraform/
│   ├── bootstrap/              # Bucket S3 para remote state (backend local)
│   ├── main.tf, vpc.tf, cluster.tf, nodes.tf, ...
│   ├── terraform.tfvars.example   # perfil conta pessoal (commitado)
│   └── backend.hcl.example
└── scripts/
    └── terraform-preflight.ps1    # validação antes de apply
```

## O que o Terraform cria

| Recurso | Arquivo | Descrição |
|---|---|---|
| VPC `10.0.0.0/16` | `vpc.tf` | Rede isolada |
| 2 subnets públicas | `vpc.tf` | Uma por AZ, nodes EKS |
| Internet Gateway | `vpc.tf` | Saída à internet (sem NAT) |
| EKS cluster | `cluster.tf` | Control plane Kubernetes 1.31 |
| OIDC provider | `cluster.tf` | IRSA para EBS CSI |
| Managed node group | `nodes.tf` | Spot `t3.small`, 1–2 nodes |
| IAM roles | `iam.tf`, `cluster.tf` | Cluster, nodes, EBS CSI (conta pessoal) |
| Security groups | `vpc.tf` | NodePort 30080, kubelet 10250, metrics |
| EKS addons | `storage.tf` | vpc-cni, coredns, aws-ebs-csi-driver |
| Access entries | `cluster.tf` | Admin no cluster para seu IAM |

**Não criado pelo Terraform:** API, Mongo, HPA, metrics-server (manifests em `k8s/`).

## Bootstrap do remote state (S3)

Problema chicken-and-egg: o state do EKS precisa estar no S3, mas o bucket ainda não existe.

**Solução:** stack separada em `infra/terraform/bootstrap/` com backend **local**.

| Recurso bootstrap | Função |
|---|---|
| S3 bucket `techchallenge-tfstate-{ACCOUNT_ID}` | Armazena `terraform.tfstate` |
| Versioning + SSE | Proteção e recuperação |
| `prevent_destroy = true` | Impede destruição acidental |

Após apply, copiar `backend_config_snippet` para `infra/terraform/backend.hcl`.

Detalhes: [`infra/terraform/bootstrap/README.md`](../infra/terraform/bootstrap/README.md).

### Bootstrap local (CLI)

```bash
cd infra/terraform/bootstrap
terraform init
terraform apply
terraform output backend_config_snippet
```

## Cluster EKS — apply local (CLI)

```bash
# Pré-requisitos: Terraform >= 1.5, AWS CLI, credenciais configuradas

cd infra/terraform
cp terraform.tfvars.example terraform.tfvars   # ajustar se necessário
# backend.hcl já criado a partir do bootstrap

terraform init -upgrade -backend-config=backend.hcl
terraform plan
terraform apply

# Conectar kubectl
aws eks update-kubeconfig --region us-east-1 --name techchallenge-eks
terraform output configure_kubectl
```

**Pre-flight (Windows):**

```powershell
.\infra\scripts\terraform-preflight.ps1 -RunPlan
```

## Perfis de conta

| Perfil | Arquivo | Quando usar |
|---|---|---|
| **Pessoal** (padrão) | `terraform.tfvars.example` | Conta AWS com permissão IAM |
| **Academy** | `terraform.tfvars.academy.example` | Lab FIAP com `LabRole` |

Este projeto usa o perfil **pessoal** nos workflows GitHub Actions.

## Via GitHub Actions

| Workflow | Função |
|---|---|
| `terraform-bootstrap.yml` | Cria bucket S3; auto-grava `TF_STATE_BUCKET`, `TF_BACKEND_HCL` |
| `terraform.yml` | Manual: `plan`, `apply`, `destroy` do EKS |

Ordem completa: [GITHUB-ACTIONS.md](GITHUB-ACTIONS.md).

## Secrets e variáveis

### Manuais (criar antes de rodar workflows)

| Secret | Uso |
|---|---|
| `AWS_ACCESS_KEY_ID` | Terraform + CD |
| `AWS_SECRET_ACCESS_KEY` | Terraform + CD |
| `GH_REPO_PAT` | Bootstrap auto-push de secrets (fine-grained: Secrets + Variables read/write) |
| `JWT_SECRET` | Terraform — Lambdas auth-sign / auth-authorizer |
| `AUTH_EMAIL` | Terraform — credencial de login do Lambda |
| `AUTH_PASSWORD` | Terraform — senha de login do Lambda |

### Auto-configurados pelo Bootstrap

| Nome | Tipo |
|---|---|
| `TF_STATE_BUCKET` | Secret |
| `TF_BACKEND_HCL` | Secret |
| `TF_AWS_REGION` | Variable (`us-east-1`) |
| `TF_STATE_KEY` | Variable (`eks/terraform.tfstate`) |

### Variáveis opcionais

| Variable | Default | Uso |
|---|---|---|
| `TF_CLUSTER_NAME` | `techchallenge-eks` | CD — `update-kubeconfig` |
| `ENABLE_AUTH_GATEWAY` | `false` | Terraform — EKS + API Gateway + Lambdas no mesmo apply |
| `JWT_EXPIRES_IN` | `1h` | Terraform — expiração do JWT nos Lambdas |
| `EKS_BACKEND_URL` | — | Opcional — override manual de `eks_backend_url` |

### Mapeamento tfvars ↔ GitHub Actions

| Terraform variable | Origem na pipeline | Tipo GitHub |
|---|---|---|
| `enable_auth_gateway` | `ENABLE_AUTH_GATEWAY` | Variable |
| `eks_backend_url` | `EKS_BACKEND_URL` (opcional) | Variable — default: IP público do node `:30080` |
| `jwt_secret` | `JWT_SECRET` | Secret |
| `auth_email` | `AUTH_EMAIL` | Secret |
| `auth_password` | `AUTH_PASSWORD` | Secret |
| `jwt_expires_in` | `JWT_EXPIRES_IN` | Variable |

Demais variáveis (`cluster_name`, `node_*`, etc.) continuam no `terraform.tfvars.example` copiado no workflow.

## Destroy

```text
1. Terraform workflow → destroy (remove EKS, VPC, etc.)
2. Bucket S3: prevent_destroy — remoção manual no console se necessário
3. Bootstrap: sem destroy no workflow (proteção do state)
```

## Documentação técnica completa

- [`infra/terraform/README.md`](../infra/terraform/README.md) — troubleshooting EBS CSI, CoreDNS, Academy
- [GitHub Actions](GITHUB-ACTIONS.md)
- [Kubernetes](KUBERNETES.md)
