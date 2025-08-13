variable "b2_key_id" {
  description = "Backblaze B2 Key ID."
  type        = string
  sensitive   = true
}

variable "b2_app_key" {
  description = "Backblaze B2 Application Key."
  type        = string
  sensitive   = true
}

variable "b2_bucket" {
  description = "Backblaze B2 Bucket Name."
  type        = string
}

variable "b2_endpoint" {
  description = "Backblaze B2 Endpoint URL."
  type        = string
  default     = "https://s3.us-west-002.backblazeb2.com"
}
