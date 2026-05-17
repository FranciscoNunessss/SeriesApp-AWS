"""
Lambda handler usando Mangum para adaptar FastAPI ao AWS Lambda + API Gateway HTTP API.
"""
import sys
import os
#test
# Adicionar o diretório da app ao path para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from mangum import Mangum
from app.main import app

# Handler Lambda que adapta FastAPI para API Gateway HTTP API
api_base_path = os.getenv("API_BASE_PATH", "/dev")
lambda_handler = Mangum(app, lifespan="off", api_gateway_base_path=api_base_path)
