output "cluster_name" {
  description = "EKS cluster name"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster control plane"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "node_security_group_id" {
  description = "Security group ID for worker nodes"
  value       = aws_security_group.node.id
}

output "configure_kubectl" {
  description = "Command to configure kubectl for this cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.main.name}"
}

output "caller_arn" {
  description = "STS caller identity (your current session)"
  value       = data.aws_caller_identity.current.arn
}

output "cluster_admin_principal_arn" {
  description = "IAM principals granted EKS cluster admin via access entries"
  value       = local.cluster_admin_principals
}

output "public_subnet_ids" {
  description = "Public subnet IDs used by the cluster"
  value       = aws_subnet.public[*].id
}

output "cluster_role_arn" {
  description = "IAM role used by the EKS control plane"
  value       = local.cluster_role_arn
}

output "node_role_arn" {
  description = "IAM role used by worker nodes"
  value       = local.node_role_arn
}

output "get_node_public_ip" {
  description = "Command to find a worker node public IP for NodePort access"
  value       = "kubectl get nodes -o wide"
}

output "auth_api_gateway_url" {
  description = "Invoke URL for the JWT auth HTTP API (empty when enable_auth_gateway is false)"
  value       = var.enable_auth_gateway ? aws_apigatewayv2_api.auth[0].api_endpoint : ""
}

output "auth_sign_lambda_name" {
  description = "Name of the JWT sign Lambda function"
  value       = var.enable_auth_gateway ? aws_lambda_function.auth_sign[0].function_name : ""
}

output "auth_authorizer_lambda_name" {
  description = "Name of the JWT authorizer Lambda function"
  value       = var.enable_auth_gateway ? aws_lambda_function.auth_authorizer[0].function_name : ""
}

output "eks_backend_url" {
  description = "Backend URL used by API Gateway HTTP integrations (auto-derived from EKS node IP when not overridden)"
  value       = var.enable_auth_gateway ? local.eks_backend_url : ""
}
