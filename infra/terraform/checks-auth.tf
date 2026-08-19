check "auth_gateway_requires_backend_url" {
  assert {
    condition     = !var.enable_auth_gateway || local.eks_backend_url != ""
    error_message = "Could not resolve eks_backend_url from EKS nodes. Ensure nodes have public IPs or set eks_backend_url manually."
  }
}

check "auth_gateway_requires_jwt_secret" {
  assert {
    condition     = !var.enable_auth_gateway || var.jwt_secret != ""
    error_message = "jwt_secret must be set when enable_auth_gateway is true."
  }
}
