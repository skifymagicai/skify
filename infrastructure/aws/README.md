# Skify AWS Infrastructure

- ECS Fargate for backend/frontend containers
- RDS Postgres for database
- S3 for file storage
- ElastiCache Redis for queue/cache
- ECR for Docker images
- CloudWatch for logs/monitoring
- Route53 for DNS
- Secrets Manager for secrets

## Usage

1. Install Terraform and AWS CLI
2. Configure AWS credentials (`aws configure`)
3. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill in secrets
4. Run `terraform init && terraform apply` in this directory

---

All resources are tagged with the project name for easy cleanup.
