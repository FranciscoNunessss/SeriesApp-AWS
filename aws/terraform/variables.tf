variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resources"
  type        = string
  default     = "seriesapp"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# VPC Configuration
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# Database Configuration
variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15.18"
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Database allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "series_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

# API Configuration
variable "cors_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:5173"]
}

# Notification Configuration
variable "admin_phone_number" {
  description = "Admin phone number for SMS notifications (e.g., +1234567890)"
  type        = string
  sensitive   = true
  default     = "+1234567890"
}

# IAM / Lambda role configuration (useful for restricted lab accounts)
variable "create_lambda_iam_resources" {
  description = "Whether Terraform should create and manage Lambda IAM role and policies"
  type        = bool
  default     = true
}

variable "existing_lambda_role_arn" {
  description = "Existing Lambda execution role ARN to use when create_lambda_iam_resources=false"
  type        = string
  default     = ""

  validation {
    condition     = var.create_lambda_iam_resources || length(trimspace(var.existing_lambda_role_arn)) > 0
    error_message = "existing_lambda_role_arn must be provided when create_lambda_iam_resources is false."
  }
}

# Secrets Manager configuration
variable "db_secret_name" {
  description = "Optional override for DB credentials secret name. Useful when original name is pending deletion."
  type        = string
  default     = null
}
