# AWS Academy Lab - Cost Monitoring

## Budget Alert: $50 per course

### Estratégia de Controlo de Custos

1. **Usar recursos Free Tier**
   - Lambda: 1M requisições/mês grátis
   - API Gateway: 1M requisições/mês grátis
   - RDS: db.t3.micro qualifica para free tier (1 ano)
   - S3: 5GB armazenamento grátis
   - CloudWatch: 10GB logs grátis

2. **Otimizações de Cost**

| Ação | Potencial Savings |
|------|-------------------|
| Usar db.t3.micro em dev | $10-15/mês |
| 1 Lambda function vs múltiplas | $2-5/mês |
| Guardar secretos com Secrets Manager | ~$0.40/mês |
| API Gateway HTTP API vs REST | 30% mais barato |
| S3 versioning desativado | ~$1/mês |

3. **Monitoring de Custos**

```bash
# Via AWS Console
1. Ir a Billing Dashboard
2. Ver "Estimated charges"
3. Drill-down por serviço

# Via AWS CLI
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

4. **Budget Alerts**

```bash
# Criar budget alert via CLI
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

### Exemplo budget.json
```json
{
  "BudgetName": "SeriesApp-Dev",
  "BudgetLimit": {
    "Amount": "40",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

## Dicas para Não Exceder $50

✅ **DO**
- Usar componentes serverless (Lambda, API Gateway)
- Manter DB em free tier (db.t3.micro)
- Aproveitar free tier quotas
- Desligar recursos quando não em uso (dev)
- Usar S3 para ficheiros estáticos

❌ **DON'T**
- Deixar EC2/RDS instances sempre ligadas
- Usar Multi-AZ em development
- Transferir muitos dados entre regiões
- Armazenar muitos dados em S3 sem lifecycle
- Fazer muitas requisições API sem cache

## Destruir Recursos (Quando Terminar)

```bash
# IMPORTANTE: Destruir para evitar charges
terraform destroy -var-file="terraform.tfvars"

# Confirmar que tudo foi deletado
aws rds describe-db-instances
aws s3 ls
aws lambda list-functions
```
