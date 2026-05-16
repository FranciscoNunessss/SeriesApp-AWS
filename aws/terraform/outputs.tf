output "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.api.api_endpoint
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.api.id
}

output "database_endpoint" {
  description = "RDS Database endpoint"
  value       = module.database.rds_endpoint
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = var.db_name
}

output "s3_bucket_name" {
  description = "S3 bucket for application storage"
  value       = aws_s3_bucket.app_storage.id
}

output "sns_topic_arn" {
  description = "SNS Topic ARN for notifications"
  value       = aws_sns_topic.notifications.arn
}

output "lambda_role_arn" {
  description = "Lambda IAM Role ARN"
  value       = local.lambda_role_arn
}

output "lambda_security_group_id" {
  description = "Lambda Security Group ID"
  value       = aws_security_group.lambda_sg.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs for Lambda deployment"
  value       = module.networking.private_subnet_ids
}

output "main_lambda_function_name" {
  description = "Main Lambda function name (FastAPI handler)"
  value       = aws_lambda_function.main_handler.function_name
}

output "main_lambda_function_arn" {
  description = "Main Lambda function ARN"
  value       = aws_lambda_function.main_handler.arn
}

output "daily_lambda_function_name" {
  description = "Daily notifications Lambda function name"
  value       = aws_lambda_function.daily_notifications.function_name
}

output "daily_lambda_function_arn" {
  description = "Daily notifications Lambda function ARN"
  value       = aws_lambda_function.daily_notifications.arn
}

output "secrets_manager_secret_arn" {
  description = "Secrets Manager secret ARN for DB credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}
