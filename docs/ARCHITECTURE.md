# SeriesApp - AWS Architecture Documentation

## Overview

A **SeriesApp** é uma aplicação cloud-native desenvolvida para AWS, utilizando serviços serverless e geridos para máxima escalabilidade, confiabilidade e otimização de custos.

## Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Netlify)                       │
│                   React + TypeScript + Vite                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
         ┌───────────────────────────────────┐
         │      API Gateway (HTTP API)        │
         │  - CORS Configuration              │
         │  - Request/Response Validation     │
         └────────────┬────────────────────────┘
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
    ┌────────┐   ┌────────┐   ┌──────────────┐
    │Lambda 1│   │Lambda 2│   │  Lambda N    │
    │(REST)  │   │(Events)│   │(Scheduler)   │
    └───┬────┘   └───┬────┘   └────┬─────────┘
        │            │             │
        └────────────┼─────────────┘
                     │
         ┌───────────┼──────────────┐
         │           │              │
         ▼           ▼              ▼
    ┌────────┐  ┌────────┐    ┌──────────┐
    │  RDS   │  │  S3    │    │   SNS    │
    │ Postgres│ │Bucket  │    │(SMS/Email)
    └────────┘  └────────┘    └──────────┘
         │
         ▼
    ┌──────────────┐
    │  EventBridge │ (Scheduler de notificações)
    └──────────────┘
```

## Componentes AWS

### 1. **API Gateway (HTTP API)**
- **Função**: Ponto de entrada para todas as requisições HTTP
- **Protocolo**: HTTP/REST
- **CORS**: Configurado para Netlify + localhost (desenvolvimento)
- **Features**:
  - Request validation
  - Response compression
  - Throttling e rate limiting
  - CloudWatch logging

### 2. **AWS Lambda Functions**
- **Função**: Processamento de requisições sem servidor
- **Trigger**: API Gateway + EventBridge (scheduler)
- **Linguagem**: Python 3.13
- **VPC Integration**: Conecta-se à RDS em subnet privada
- **Concorrência**: Auto-scaling baseado em demand

#### Lambda Functions:
- **main.py**: Handler principal para operações CRUD
- **daily_notifications.py**: Verificação diária de alertas

### 3. **RDS PostgreSQL**
- **Engine**: PostgreSQL 15.4
- **Instance Class**: db.t3.micro (dev) → db.t3.small/medium (prod)
- **Storage**: 20GB gp3 (desenvolvimento)
- **Backup**: 7 dias de retenção
- **Multi-AZ**: Ativo para alta disponibilidade
- **Segurança**:
  - Encryption at rest (KMS)
  - VPC privada (não acessível publicamente)
  - Security groups restrictivos

### 4. **S3 Bucket**
- **Função**: Armazenamento de ficheiros (imagens, documentos, etc.)
- **Versioning**: Ativado para recuperação de versões anteriores
- **Encryption**: AES-256 por padrão
- **Public Access**: Bloqueado completamente
- **Lifecycle Policy**: Removível (configurar conforme necessário)

### 5. **SNS (Simple Notification Service)**
- **Função**: Envio de SMS e emails
- **Subscribers**: Telefone do administrador (SMS)
- **Trigger**: Lambda functions (quando regra é acionada)
- **Filtros**: Message attributes para routing

### 6. **EventBridge**
- **Função**: Scheduler para execução de tarefas periódicas
- **Schedule**: Daily check às 09:00 UTC
- **Target**: Lambda (daily_notifications)
- **Exemplo**: Verificar novas séries/episódios uma vez por dia

### 7. **Secrets Manager**
- **Função**: Armazenar credenciais de forma segura
- **Conteúdo**: DB host, username, password, port
- **Acesso**: Apenas Lambda pode ler
- **Rotação**: Configurável

## Fluxo de Dados

### Requisição HTTP
```
1. Cliente (Netlify Frontend)
   ↓
2. API Gateway (valida, CORS)
   ↓
3. Lambda Handler (main.py)
   ↓
4. Secrets Manager (obter credenciais BD)
   ↓
5. RDS PostgreSQL (query/insert/update)
   ↓
6. Lambda responde
   ↓
7. API Gateway (serializa JSON)
   ↓
8. Cliente recebe resposta
```

### Notificação Diária
```
1. EventBridge trigger (scheduler diário)
   ↓
2. Lambda (daily_notifications.py)
   ↓
3. RDS PostgreSQL (query: novas séries/episódios?)
   ↓
4. SNS Publish (se houver alertas)
   ↓
5. Admin recebe SMS
```

## Ambiente de Desenvolvimento vs Produção

| Aspecto | Dev | Prod |
|--------|-----|------|
| DB Instance | db.t3.micro | db.t3.small/medium |
| Storage | 20GB | 100GB+ |
| Multi-AZ | Não | Sim |
| Backup Retention | 7 dias | 30 dias |
| Lambda Concorrência | Ilimitada | Reserved (otimizado) |
| Logging | CloudWatch | CloudWatch + centralized |
| Monitoring | Básico | X-Ray + Custom Metrics |

## Segurança

1. **Network Security**
   - VPC isolada
   - RDS em subnet privada
   - NAT Gateway para saída

2. **Application Security**
   - API Keys/JWT (implementar no frontend)
   - Lambda IAM roles com least privilege
   - Secrets Manager para credenciais

3. **Data Security**
   - Encryption at rest (RDS, S3)
   - Encryption in transit (HTTPS/TLS)
   - Audit logging (CloudTrail)

4. **Access Control**
   - IAM roles para Lambda
   - Resource-based policies
   - VPC security groups

## Custos Estimados (Mensal)

### Cenário: 1000 utilizadores, ~100k requisições/mês

| Serviço | Estimativa | Detalhes |
|---------|-----------|----------|
| API Gateway | $3.50 | $3.50 por 1M requisições |
| Lambda | $5-10 | Depende duração/memória |
| RDS (db.t3.micro) | $15-20 | Dev tier |
| S3 | $1-2 | Armazenamento + transfers |
| SNS | $0.50-1 | SMS (~30/mês) + emails |
| Secrets Manager | $0.40 | Fixo |
| **Total** | **~$25-35** | Muito abaixo do limite de $50 |

*Nota: Custos podem variar conforme usage. AWS free tier cobre bastante nos primeiros 12 meses.*

## Deployment

### Terraform
```bash
# Inicializar Terraform
terraform init

# Validar configuração
terraform plan -var-file="terraform.tfvars"

# Aplicar infraestrutura
terraform apply -var-file="terraform.tfvars"

# Obter outputs
terraform output
```

### Lambda Deployment
```bash
# Comprimir função
cd aws/lambda
zip -r function.zip functions/ -x "*.git*"

# Fazer upload via AWS CLI ou Terraform
aws lambda update-function-code \
  --function-name seriesapp-main \
  --zip-file fileb://function.zip
```

### Frontend (Netlify)
```bash
# Conectar repositório GitHub
# Netlify detecta automaticamente frontend/

# Environment variables
VITE_API_BASE_URL=https://api-id.execute-api.region.amazonaws.com
```

## Próximos Passos

1. ✅ Infraestrutura AWS com Terraform
2. ⏳ Adaptação do código backend para Lambda
3. ⏳ Deploy das Lambda functions
4. ⏳ Configurar API Gateway integrations
5. ⏳ Deploy do frontend no Netlify
6. ⏳ Testes e optimização
7. ⏳ Presentation & Report

## Referências

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway HTTP APIs](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api.html)
- [RDS Security](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
