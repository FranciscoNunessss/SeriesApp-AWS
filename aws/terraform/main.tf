terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Descomenta para usar S3 remote state
  # backend "s3" {
  #   bucket         = "seriesapp-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC e Networking
module "networking" {
  source = "./modules/networking"

  vpc_cidr             = var.vpc_cidr
  availability_zones   = data.aws_availability_zones.available.names
  private_subnet_cidrs = var.private_subnet_cidrs
  public_subnet_cidrs  = var.public_subnet_cidrs
}

# Database (RDS PostgreSQL)
module "database" {
  source = "./modules/database"

  identifier          = "${var.project_name}-db"
  engine              = "postgres"
  engine_version      = var.postgres_version
  instance_class      = var.db_instance_class
  allocated_storage   = var.db_allocated_storage
  db_name             = var.db_name
  username            = var.db_username
  password            = random_password.db_password.result
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = module.networking.db_subnet_group_name

  skip_final_snapshot = var.environment == "dev"
  
  tags = {
    Name = "${var.project_name}-database"
  }
}

# S3 Bucket para armazenar ficheiros
resource "aws_s3_bucket" "app_storage" {
  bucket = "${var.project_name}-storage-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name = "${var.project_name}-storage"
  }
}

resource "aws_s3_bucket_versioning" "app_storage_versioning" {
  bucket = aws_s3_bucket.app_storage.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage_encryption" {
  bucket = aws_s3_bucket.app_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "app_storage_block" {
  bucket = aws_s3_bucket.app_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM Role para Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Policies para Lambda
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# Policy customizada para S3, SNS, EventBridge
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.app_storage.arn}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.notifications.arn
      },
      {
        Effect = "Allow"
        Action = [
          "events:PutEvents"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      }
    ]
  })
}

# API Gateway
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_credentials = true
    allow_headers     = ["content-type", "authorization"]
    allow_methods     = ["*"]
    allow_origins     = var.cors_origins
    expose_headers    = ["x-amzn-requestid"]
    max_age           = 300
  }
}

resource "aws_apigatewayv2_stage" "api" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = var.environment
  auto_deploy = true
}

# SNS Topic para notificações
resource "aws_sns_topic" "notifications" {
  name = "${var.project_name}-notifications"
}

resource "aws_sns_topic_subscription" "admin_sms" {
  topic_arn            = aws_sns_topic.notifications.arn
  protocol             = "sms"
  endpoint             = var.admin_phone_number
  filter_policy_scope  = "MessageAttributes"
  
  filter_policy = jsonencode({
    notification_type = ["sms_alert"]
  })
}

# EventBridge Rule para daily notifications
resource "aws_cloudwatch_event_rule" "daily_check" {
  name                = "${var.project_name}-daily-check"
  description         = "Daily check for notifications"
  schedule_expression = "cron(0 9 * * ? *)" # 9 AM UTC diariamente

  tags = {
    Name = "${var.project_name}-daily-check"
  }
}

# Secrets Manager para credenciais da BD
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.project_name}/db/credentials"

  tags = {
    Name = "${var.project_name}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    host     = module.database.rds_endpoint
    port     = 5432
    dbname   = var.db_name
  })
}

# Security Group para RDS
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS"
  vpc_id      = module.networking.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda_sg.id]
    description     = "Allow from Lambda"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

# Security Group para Lambda
resource "aws_security_group" "lambda_sg" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for Lambda"
  vpc_id      = module.networking.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-lambda-sg"
  }
}

# Password aleatória para DB
resource "random_password" "db_password" {
  length  = 32
  special = true
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}
