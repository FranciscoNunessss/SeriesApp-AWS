# SeriesApp-AWS

Guia rapido para levantar, configurar e validar o projeto (backend em AWS + frontend no Netlify).

## 1) Comandos locais

Iniciar API local:

```bash
uvicorn --app-dir src app.main:app --reload
```

Levantar com Docker:

```bash
docker compose up -d --build
```

Parar Docker:

```bash
docker compose down
```

## 2) Terraform (AWS)

Entrar na pasta:

```bash
cd aws/terraform
```

Inicializar e aplicar:

```bash
terraform init
terraform apply -auto-approve
```

Obter endpoint da API Gateway:

```bash
terraform output api_gateway_endpoint
```

Notas importantes:
- `terraform.tfvars` e `terraform.tfstate` sao ficheiros locais e estao no `.gitignore`.
- Para partilhar configuracao no repo, usa `terraform.tfvars.example`.

## 3) Frontend no Netlify

No Netlify, criar a variavel:

- Key: `VITE_API_BASE_URL`
- Value: `https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/api/v1`

Exemplo real:

`https://az0gxpgfie.execute-api.us-east-1.amazonaws.com/dev/api/v1`

Depois disso, fazer novo deploy do site.

## 4) CORS (API Gateway)

Se o browser mostrar erro de CORS, confirmar que o origin do frontend esta autorizado.

Exemplo de origin valido:

`https://peaceful-gnome-7968fe.netlify.app`

No Terraform, isso e controlado por `cors_origins`.

## 5) Testes rapidos (fim a fim)

Health:

```bash
curl.exe -i "https://az0gxpgfie.execute-api.us-east-1.amazonaws.com/dev/health"
```

Users:

```bash
curl.exe -i "https://az0gxpgfie.execute-api.us-east-1.amazonaws.com/dev/api/v1/users/"
```

Preflight CORS (origin do Netlify):

```bash
curl.exe -i -X OPTIONS "https://az0gxpgfie.execute-api.us-east-1.amazonaws.com/dev/api/v1/users/" ^
	-H "Origin: https://peaceful-gnome-7968fe.netlify.app" ^
	-H "Access-Control-Request-Method: GET" ^
	-H "Access-Control-Request-Headers: content-type,authorization"
```

Se isto devolver `200 OK`, CORS esta correto para o frontend.

## 6) Problemas comuns

- Frontend com `Failed to fetch`:
	- confirmar `VITE_API_BASE_URL` no Netlify;
	- confirmar CORS no API Gateway para o dominio exato do frontend.

- Alteracoes de Terraform nao aparecem para commit:
	- normal, porque `terraform.tfvars` e `terraform.tfstate` estao ignorados.

- `terraform apply` falha com secret em delete:
	- usar `db_secret_name` com nome novo (ex.: `seriesapp/db/credentials-v2`).
