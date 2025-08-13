# Backblaze B2 Integration

Skify uses Backblaze B2 as its cloud storage provider for file uploads and static assets.

## Configuration
- Set your B2 credentials in `terraform.tfvars` or `backblaze.tfvars`.
- The backend and frontend will use the following environment variables:
  - `S3_ENDPOINT` (set to your B2 endpoint)
  - `S3_ACCESS_KEY` (your B2 Key ID)
  - `S3_SECRET_KEY` (your B2 App Key)
  - `S3_BUCKET` (your B2 bucket name)

## Terraform
- Variables for B2 are defined in `backblaze.tf`.
- Example values in `backblaze.tfvars.example`.
- These can be passed to your app as environment variables via ECS task definitions or GitHub Actions secrets.

---

No AWS S3 resources will be created; only B2 is used for storage.
