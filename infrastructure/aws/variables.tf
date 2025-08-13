variable "aws_region" {
  description = "AWS region to deploy resources in."
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming."
  default     = "skify"
}

variable "db_password" {
  description = "RDS database password."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for app."
  type        = string
  sensitive   = true
}
