output "state_bucket_name" {
  description = "S3 bucket that stores terraform.tfstate"
  value       = aws_s3_bucket.terraform_state.id
}

output "backend_config_snippet" {
  description = "Copy these values into infra/terraform/backend.hcl"
  value       = <<-EOT
    bucket       = "${aws_s3_bucket.terraform_state.id}"
    key          = "eks/terraform.tfstate"
    region       = "${var.aws_region}"
    encrypt      = true
    use_lockfile = true
  EOT
}
