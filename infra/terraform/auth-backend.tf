variable "api_node_port" {
  description = "NodePort exposed by api-service on EKS worker nodes"
  type        = number
  default     = 30080
}

data "aws_instances" "eks_nodes" {
  count = var.enable_auth_gateway ? 1 : 0

  filter {
    name   = "tag:eks:nodegroup-name"
    values = [aws_eks_node_group.main.node_group_name]
  }

  filter {
    name   = "tag:eks:cluster-name"
    values = [aws_eks_cluster.main.name]
  }

  filter {
    name   = "instance-state-name"
    values = ["running"]
  }

  depends_on = [aws_eks_node_group.main]
}

locals {
  eks_node_public_ips = var.enable_auth_gateway ? try(data.aws_instances.eks_nodes[0].public_ips, []) : []
  eks_node_public_ip  = length(local.eks_node_public_ips) > 0 ? local.eks_node_public_ips[0] : ""

  eks_backend_url = var.eks_backend_url != "" ? var.eks_backend_url : (
    var.enable_auth_gateway && local.eks_node_public_ip != "" ?
    "http://${local.eks_node_public_ip}:${var.api_node_port}" :
    ""
  )
}
