# Skify Cloud Automation Plan

## 1. Cloud Platform: AWS (default, can be changed)
- Uses ECS Fargate for container orchestration
- RDS for managed Postgres
- S3 for file storage
- ElastiCache for Redis
- CloudWatch for logs/monitoring
- Route53 for DNS

## 2. Infrastructure as Code
- Terraform scripts for all resources
- Automated provisioning and teardown

## 3. CI/CD
- GitHub Actions: Build, test, push Docker images to ECR, deploy to ECS
- Zero-downtime deploys with ECS rolling updates

## 4. Database
- Automated migrations via CI/CD (Drizzle or Prisma)
- Nightly backups (RDS automated snapshots)

## 5. Monitoring & Alerts
- CloudWatch dashboards and alarms
- Health checks for backend/frontend

## 6. Secrets Management
- AWS Secrets Manager for all secrets

## 7. Rollback & Recovery
- Automated rollback on failed deploy
- Recovery checklist in docs

---

### Next Steps
- Scaffold Terraform scripts in `infrastructure/`
- Add GitHub Actions workflow for cloud deploy
- Add migration/backup scripts
- Add monitoring/alerting setup
- Update docs for cloud deployment
