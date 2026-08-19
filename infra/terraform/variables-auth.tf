variable "enable_auth_gateway" {
  description = "Deploy API Gateway HTTP API with JWT sign/authorizer Lambdas"
  type        = bool
  default     = false
}

variable "eks_backend_url" {
  description = "Optional override for API Gateway HTTP integration. When empty, Terraform derives http://<node-public-ip>:<api_node_port> from the EKS node group."
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "Shared HS256 secret for JWT sign and verify Lambdas"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_expires_in" {
  description = "JWT expiration passed to the sign Lambda"
  type        = string
  default     = "1h"
}

variable "auth_email" {
  description = "Login email validated by the sign Lambda"
  type        = string
  sensitive   = true
  default     = "admin@example.com"
}

variable "auth_password" {
  description = "Login password validated by the sign Lambda"
  type        = string
  sensitive   = true
  default     = "admin123"
}
