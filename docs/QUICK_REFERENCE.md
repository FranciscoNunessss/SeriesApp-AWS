# Quick Reference - SeriesApp AWS

## 📋 Comandos Rápidos

### Setup
```bash
# Windows
.\setup.ps1

# Linux/Mac
bash setup.sh
```

### Terraform
```bash
cd aws/terraform

# Planejar
terraform plan -var-file="terraform.tfvars"

# Aplicar
terraform apply -var-file="terraform.tfvars"

# Destruir
terraform destroy -var-file="terraform.tfvars"

# Ver outputs
terraform output
```

### Lambda
```bash
cd aws/lambda

# Instalar deps
pip install -r requirements.txt -t packages/

# Compactar
zip -r function.zip functions/ packages/ -x "*.pyc"

# Deploy
aws lambda update-function-code \
  --function-name seriesapp-main \
  --zip-file fileb://function.zip
```

### Frontend
```bash
cd frontend

# Instalar
pnpm install

# Dev
pnpm dev

# Build
pnpm build

# Deploy (Netlify)
netlify deploy --prod --dir=dist
```

### Database
```bash
# Conectar
psql -h [RDS_ENDPOINT] -U postgres -d series_db

# Ver outputs (incl. RDS endpoint)
cd aws/terraform
terraform output
```

### Logs
```bash
# Lambda logs
aws logs tail /aws/lambda/seriesapp-main --follow

# API Gateway logs
aws logs tail /aws/apigateway/seriesapp-api --follow
```

---

## 🔑 Variáveis de Ambiente Importantes

```bash
# Terraform
AWS_REGION=us-east-1
admin_phone_number=+351912345678  # EDITAR!

# Lambda
DB_SECRET_ARN=seriesapp/db/credentials
SNS_TOPIC_ARN=arn:aws:sns:...

# Frontend
VITE_API_BASE_URL=https://api-id.execute-api.us-east-1.amazonaws.com
```

---

## 📞 API Endpoints

```
GET    /api/v1/series
POST   /api/v1/series

GET    /api/v1/episodes
POST   /api/v1/episodes

GET    /api/v1/seasons
POST   /api/v1/seasons

GET    /api/v1/users
POST   /api/v1/users

GET    /api/v1/watched
POST   /api/v1/watched
```

---

## 🐛 Troubleshooting

### Lambda não consegue ligar-se à RDS
```bash
# 1. Verificar security groups
aws ec2 describe-security-groups --group-ids sg-xxxxx

# 2. Verificar VPC
aws ec2 describe-network-interfaces --filters "Name=subnet-id,Values=subnet-xxxxx"

# 3. Testar conexão
psql -h [ENDPOINT] -U postgres -d series_db
```

### 404 - Endpoint não encontrado
```bash
# Verificar API Gateway integrations
aws apigatewayv2 get-integration --api-id [API_ID] --integration-id [INT_ID]

# Verificar Lambda permissions
aws lambda get-policy --function-name seriesapp-main
```

### SMS não envia
```bash
# Verificar SNS subscriptions
aws sns list-subscriptions-by-topic --topic-arn [TOPIC_ARN]

# Verificar SMS account status
aws sns get-sms-attributes
```

### Custo muito alto?
```bash
# Ver custos por serviço
aws ce get-cost-and-usage \
  --time-period Start=2024-05-01,End=2024-05-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE
```

---

## 📊 Arquitetura Resumida

```
Netlify Frontend
    ↓ HTTPS
API Gateway
    ↓
Lambda (Python 3.13)
    ↓
RDS PostgreSQL

+ S3 (files)
+ SNS (SMS alerts)
+ EventBridge (scheduler daily)
```

---

## 🚀 Deployment Checklist

- [ ] AWS Credentials configuradas
- [ ] terraform.tfvars editado (phone number!)
- [ ] Terraform apply executado
- [ ] RDS endpoint funcional
- [ ] Lambda function deployada
- [ ] API Gateway working
- [ ] Frontend deployed (Netlify)
- [ ] Testes funcionalidade completa
- [ ] Cost monitoring active
- [ ] Destruir recursos após apresentação

---

## 📚 Documentação Completa

- [ARCHITECTURE.md](ARCHITECTURE.md) - Diagrama e componentes
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Passo a passo
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - FastAPI → Lambda
- [COST_MONITORING.md](COST_MONITORING.md) - Controle de custos

---

## 📅 Important Dates

- **Apresentação**: 21/05 ou 04/06 (app deve estar working!)
- **Report Final**: 07/06 (hard deadline)
- **Destruir recursos**: Após apresentação (evitar charges)

---

## 💡 Pro Tips

1. Usar `terraform plan` antes de `terraform apply`
2. Guardar `terraform output -json` para referência
3. Monitorar CloudWatch logs em tempo real
4. Testar endpoints localmente antes de deployer
5. Usar SAM CLI para testar Lambda localmente
6. Manter `.env` e credenciais fora do Git
7. Destruir recursos quando não estiver desenvolvendo

---

**Última atualização**: Maio 2024
