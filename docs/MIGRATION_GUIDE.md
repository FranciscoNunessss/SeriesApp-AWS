# Migração de FastAPI para Lambda

Esta é uma documentação de como adaptar o código FastAPI existente em `src/` para rodar em AWS Lambda com API Gateway.

## Diferenças Principais

### FastAPI vs Lambda

| Aspecto | FastAPI | Lambda |
|--------|---------|---------|
| Framework | FastAPI (web) | AWS Lambda (funções) |
| Servidor | uvicorn | AWS Runtime |
| Entrrypoint | `main.py` | `lambda_handler` |
| Requisições | Contínuo | Event-driven |
| Escalabilidade | Manual | Automática |
| Custo | Sempre ligado | Pay-per-invocation |

## Estrutura Original (FastAPI)

```python
# src/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(CORSMiddleware, ...)

@app.get("/api/v1/series")
async def get_series():
    return {"series": [...]}
```

## Estrutura para Lambda

```python
# aws/lambda/functions/main.py
import json

def lambda_handler(event, context):
    """
    event: {
        "rawPath": "/api/v1/series",
        "requestContext": {"http": {"method": "GET"}},
        "body": "..."
    }
    """
    path = event.get('rawPath', '/')
    method = event['requestContext']['http']['method']
    
    if method == 'GET' and path == '/api/v1/series':
        return {
            'statusCode': 200,
            'body': json.dumps({"series": [...]}),
            'headers': {'Content-Type': 'application/json'}
        }
```

## Passos de Migração

### 1. Converter Routers para Handlers

#### Antes (FastAPI Router)
```python
# src/app/routers/series.py
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/series")

@router.get("/")
async def list_series():
    return db.query(Series).all()

@router.post("/")
async def create_series(series: SeriesCreate):
    db_series = Series(**series.dict())
    db.add(db_series)
    db.commit()
    return db_series
```

#### Depois (Lambda Handler)
```python
# aws/lambda/functions/main.py
def handle_series_operations(method, path, body):
    conn = get_db_connection()
    
    if method == 'GET':
        # Implementar GET
        return format_response(200, {...})
    elif method == 'POST':
        # Implementar POST
        return format_response(201, {...})
```

### 2. Adaptar Database Connection

#### Antes (FastAPI - conexão persistente)
```python
# src/app/dependencies.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:pass@localhost/db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### Depois (Lambda - fetch de Secrets, sem pooling)
```python
# aws/lambda/functions/main.py
import psycopg2
import boto3

secretsmanager = boto3.client('secretsmanager')

def get_db_connection():
    # Fetch credenciais do Secrets Manager
    secret = secretsmanager.get_secret_value(SecretId='seriesapp/db/credentials')
    creds = json.loads(secret['SecretString'])
    
    # Nova conexão para cada invocação
    conn = psycopg2.connect(
        host=creds['host'],
        database=creds['dbname'],
        user=creds['username'],
        password=creds['password']
    )
    return conn
```

### 3. Converter Esquemas Pydantic para Dict

#### Antes
```python
from pydantic import BaseModel

class SeriesCreate(BaseModel):
    title: str
    description: str

@app.post("/series")
async def create(series: SeriesCreate):
    ...
```

#### Depois
```python
def handle_series_post(body):
    title = body.get('title')
    description = body.get('description')
    
    # Validação manual
    if not title or not description:
        return format_response(400, {'error': 'Missing fields'})
    
    # Resto da lógica
```

### 4. Retornar Resposta Compatível com API Gateway

```python
def format_response(status_code, body):
    """Formato esperado por API Gateway"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
        },
        'body': json.dumps(body, default=str)
    }
```

## Mapping de Endpoints

Todos os endpoints existentes devem ser replicados em `aws/lambda/functions/main.py`:

| FastAPI Endpoint | Lambda Handler | Status |
|------------------|----------------|--------|
| GET /api/v1/series | handle_series_operations | ✅ |
| POST /api/v1/series | handle_series_operations | ✅ |
| GET /api/v1/episodes | handle_episodes_operations | ✅ |
| POST /api/v1/episodes | handle_episodes_operations | ✅ |
| GET /api/v1/seasons | handle_seasons_operations | ✅ |
| POST /api/v1/seasons | handle_seasons_operations | ✅ |
| GET /api/v1/users | handle_users_operations | ✅ |
| POST /api/v1/users | handle_users_operations | ✅ |
| GET /api/v1/watched | handle_watched_operations | ✅ |
| POST /api/v1/watched | handle_watched_operations | ✅ |

## Considerações Importantes

### Cold Start
- Primeira invocação pode levar 3-5 segundos (inicializar Python runtime)
- Soluções: Lambda Provisioned Concurrency, warm-up requests

### Timeout
- Default: 3 segundos
- Máximo: 15 minutos
- Configurar conforme necessário em AWS Lambda console

### Memory
- Default: 128MB
- Mais memória = mais CPU = mais rápido (até um ponto)
- Recomendado: 256-512MB para aplicações web

### Stateless
- Lambda é stateless (sem variáveis globais persistentes)
- Cada invocação é isolada
- Usar DynamoDB/RDS para estado persistente

## Testes Locais

```bash
# Instalar SAM CLI
pip install aws-sam-cli

# Template.yaml (na pasta aws/lambda)
# Simulando invocar lambda localmente
sam local invoke -e events/get-series.json

# events/get-series.json
{
  "rawPath": "/api/v1/series",
  "requestContext": {
    "http": {
      "method": "GET"
    }
  }
}
```

## Próximas Etapas

1. ✅ Copiar código de `src/app/services` para Lambda
2. ✅ Adaptar database connections
3. ✅ Implementar routing
4. ✅ Testes locais
5. ✅ Deploy para AWS
6. ✅ Integration tests na AWS

Ver: `aws/lambda/functions/main.py` para implementação completa.
