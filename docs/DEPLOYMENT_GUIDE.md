# SeriesApp - AWS Deployment Guide

## Prerequisites

- AWS Account (com Lab Academy credentials)
- Terraform >= 1.0 instalado
- AWS CLI configurado
- Python 3.13+
- Node.js 18+ (para frontend)
- Git

## Setup Inicial

### 1. Configurar AWS Credentials

```bash
aws configure
# Inserir:
# AWS Access Key ID: [do Academy Lab]
# AWS Secret Access Key: [do Academy Lab]
# Default region: us-east-1
# Default output: json
```

### 2. Clonar e Preparar o Projeto

```bash
cd SeriesApp-AWS

# Copiar terraform.tfvars.example para terraform.tfvars
cp aws/terraform/terraform.tfvars.example aws/terraform/terraform.tfvars

# Editar terraform.tfvars e configurar:
# - admin_phone_number (com código de país, ex: +351912345678)
# - cors_origins (se desenvolvendo localmente)
```

### 3. Terraform - Deploy Infraestrutura

```bash
cd aws/terraform

# Inicializar Terraform
terraform init

# Planejar (visualizar o que será criado)
terraform plan -var-file="terraform.tfvars"

# Aplicar (criar recursos na AWS)
terraform apply -var-file="terraform.tfvars"
# Digitar 'yes' para confirmar

# Guardar os outputs (endpoint da API, etc.)
terraform output -json > outputs.json
```

### 4. Preparar Database

```bash
# Obter endpoint da RDS
API_ENDPOINT=$(terraform output -raw database_endpoint)

# Conectar à base de dados
psql -h $API_ENDPOINT -U postgres -d series_db

# Executar schema SQL (na BD)
# Ver: src/app/database.py para schema
```

### 5. Deploy Lambda Functions

```bash
cd ../../aws/lambda

# Instalar dependências
pip install -r requirements.txt -t packages/

# Comprimir função
zip -r function.zip functions/ packages/

# Deploy via AWS CLI (ou Terraform)
aws lambda update-function-code \
  --function-name seriesapp-main \
  --zip-file fileb://function.zip

# Configurar variáveis de ambiente
aws lambda update-function-configuration \
  --function-name seriesapp-main \
  --environment Variables={DB_SECRET_ARN=seriesapp/db/credentials,SNS_TOPIC_ARN=$(terraform output -raw sns_topic_arn)}
```

### 6. Conectar API Gateway

```bash
# O Terraform já cria a integração
# Obter API endpoint
API_URL=$(terraform output -raw api_gateway_endpoint)

echo "API Base URL: $API_URL"
# Exemplo: https://abc123.execute-api.us-east-1.amazonaws.com
```

### 7. Deploy Frontend (Netlify)

```bash
cd frontend

# Build para produção
npm run build
# ou
pnpm build

# Deploy no Netlify
# Opção 1: Via CLI
netlify deploy --prod --dir=dist

# Opção 2: Conectar GitHub e Netlify fará deploy automático
```

### 8. Configurar Frontend

```bash
# Em .env ou em Netlify environment variables
VITE_API_BASE_URL=https://[API_ID].execute-api.us-east-1.amazonaws.com/api/v1
```

## Verificação de Deployment

### Verificar Lambda

```bash
# Testar função Lambda via console AWS ou:
aws lambda invoke \
  --function-name seriesapp-main \
  --payload '{"rawPath":"/api/v1/series","requestContext":{"http":{"method":"GET"}}}' \
  response.json

cat response.json
```

### Testar API Gateway

```bash
# Substitua com o URL real
curl https://[API_ID].execute-api.us-east-1.amazonaws.com/api/v1/series

# Com autenticação (se implementado)
curl -H "Authorization: Bearer $TOKEN" \
  https://[API_ID].execute-api.us-east-1.amazonaws.com/api/v1/series
```

### Verificar SNS

```bash
# Confirmar subscrição
aws sns list-subscriptions-by-topic \
  --topic-arn $(terraform output -raw sns_topic_arn)
```

## Troubleshooting

### Lambda não consegue conectar à RDS

```bash
# Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Verificar VPC connectivity
aws ec2 describe-network-interfaces --filters "Name=subnet-id,Values=subnet-xxxxx"
```

### Credenciais BD não encontradas

```bash
# Verificar Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id seriesapp/db/credentials
```

### SNS não envia SMS

```bash
# Verificar SMS sandbox
aws sns list-sms-attributes --attributes MonthlySpendLimit

# Verificar subscrição
aws sns get-subscription-attributes \
  --subscription-arn $(aws sns list-subscriptions-by-topic \
    --topic-arn [TOPIC_ARN] --query 'Subscriptions[0].SubscriptionArn' --output text)
```

## Limpeza (Destruir Infraestrutura)

```bash
cd aws/terraform

# Destruir todos os recursos
terraform destroy -var-file="terraform.tfvars"
# Digitar 'yes' para confirmar

# CUIDADO: Isto remove tudo, incluindo RDS e S3!
```

## Monitoring e Logs

### CloudWatch Logs

```bash
# Ver logs da Lambda
aws logs tail /aws/lambda/seriesapp-main --follow

# Ver logs da API Gateway
aws logs tail /aws/apigateway/seriesapp-api --follow
```

### CloudWatch Metrics

Via AWS Console:
1. CloudWatch > Metrics > Lambda
2. Procurar função "seriesapp-main"
3. Verificar Duration, Errors, Invocations

## Cost Optimization Tips

1. **Lambda**
   - Aumentar timeout e memória (mais CPUs) reduz duration/custos
   - Usar Lambda Provisioned Concurrency apenas se necessário

2. **RDS**
   - Usar db.t3.micro em dev (free tier eligible)
   - Enable auto-pause em dev (se RDS Aurora)
   - Replicação multi-AZ apenas em prod

3. **S3**
   - Lifecycle policies para mover objetos antigos
   - Enable versioning apenas se necessário

4. **API Gateway**
   - Cache responses
   - Throttling para evitar abuse

## Próximas Fases

- [ ] Implementar autenticação (JWT/Cognito)
- [ ] Adicionar mais Lambda functions (upload, processar imagens)
- [ ] Configurar CloudFront para cache estático
- [ ] Setup CI/CD com GitHub Actions
- [ ] Implementar X-Ray tracing
- [ ] Setup alertas e monitoramento
