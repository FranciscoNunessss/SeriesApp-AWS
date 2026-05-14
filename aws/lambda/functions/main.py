import json
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import Dict, Any, List
import logging

# Configurar logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Clients AWS
secretsmanager_client = boto3.client('secretsmanager')
sns_client = boto3.client('sns')
s3_client = boto3.client('s3')

def get_db_connection():
    """Obter conexão com a base de dados a partir de Secrets Manager"""
    try:
        # Obter credenciais do Secrets Manager
        secret_name = os.getenv('DB_SECRET_ARN', 'seriesapp/db/credentials')
        response = secretsmanager_client.get_secret_value(SecretId=secret_name)
        
        if 'SecretString' in response:
            credentials = json.loads(response['SecretString'])
        else:
            credentials = json.loads(response['SecretBinary'])
        
        conn = psycopg2.connect(
            host=credentials['host'],
            database=credentials['dbname'],
            user=credentials['username'],
            password=credentials['password'],
            port=credentials['port']
        )
        return conn
    except Exception as e:
        logger.error(f"Erro ao conectar à base de dados: {str(e)}")
        raise

def lambda_handler(event, context):
    """
    Lambda handler para operações na API Series App
    Compatível com API Gateway HTTP API
    """
    try:
        logger.info(f"Evento recebido: {json.dumps(event)}")
        
        # Parse do evento
        http_method = event.get('requestContext', {}).get('http', {}).get('method', 'GET')
        path = event.get('rawPath', '/')
        body = event.get('body', '{}')
        
        if body and isinstance(body, str):
            try:
                body = json.loads(body)
            except:
                body = {}
        
        logger.info(f"Método: {http_method}, Path: {path}")
        
        # Routing baseado no path
        if path.startswith('/api/v1/series'):
            response = handle_series_operations(http_method, path, body)
        elif path.startswith('/api/v1/episodes'):
            response = handle_episodes_operations(http_method, path, body)
        elif path.startswith('/api/v1/seasons'):
            response = handle_seasons_operations(http_method, path, body)
        elif path.startswith('/api/v1/users'):
            response = handle_users_operations(http_method, path, body)
        elif path.startswith('/api/v1/watched'):
            response = handle_watched_operations(http_method, path, body)
        else:
            response = {
                'statusCode': 404,
                'body': json.dumps({'error': 'Endpoint not found'})
            }
        
        return response
    
    except Exception as e:
        logger.error(f"Erro no lambda handler: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error', 'message': str(e)})
        }

def handle_series_operations(method: str, path: str, body: Dict) -> Dict:
    """Operações CRUD para séries"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            # GET /api/v1/series - Listar todas as séries
            cursor.execute('SELECT * FROM series ORDER BY created_at DESC;')
            series = cursor.fetchall()
            return format_response(200, [dict(row) for row in series])
        
        elif method == 'POST':
            # POST /api/v1/series - Criar nova série
            cursor.execute('''
                INSERT INTO series (title, description, status)
                VALUES (%s, %s, %s)
                RETURNING id, title, description, status, created_at;
            ''', (body.get('title'), body.get('description'), body.get('status', 'active')))
            
            conn.commit()
            series = cursor.fetchone()
            return format_response(201, dict(series))
        
        else:
            return format_response(405, {'error': 'Method not allowed'})
    
    finally:
        cursor.close()
        conn.close()

def handle_episodes_operations(method: str, path: str, body: Dict) -> Dict:
    """Operações CRUD para episódios"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('SELECT * FROM episode ORDER BY created_at DESC LIMIT 100;')
            episodes = cursor.fetchall()
            return format_response(200, [dict(row) for row in episodes])
        
        elif method == 'POST':
            cursor.execute('''
                INSERT INTO episode (season_id, episode_number, title, description)
                VALUES (%s, %s, %s, %s)
                RETURNING id, season_id, episode_number, title;
            ''', (body.get('season_id'), body.get('episode_number'), 
                  body.get('title'), body.get('description')))
            
            conn.commit()
            episode = cursor.fetchone()
            return format_response(201, dict(episode))
        
        else:
            return format_response(405, {'error': 'Method not allowed'})
    
    finally:
        cursor.close()
        conn.close()

def handle_seasons_operations(method: str, path: str, body: Dict) -> Dict:
    """Operações CRUD para temporadas"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('SELECT * FROM season ORDER BY created_at DESC LIMIT 100;')
            seasons = cursor.fetchall()
            return format_response(200, [dict(row) for row in seasons])
        
        elif method == 'POST':
            cursor.execute('''
                INSERT INTO season (series_id, season_number, title)
                VALUES (%s, %s, %s)
                RETURNING id, series_id, season_number, title;
            ''', (body.get('series_id'), body.get('season_number'), body.get('title')))
            
            conn.commit()
            season = cursor.fetchone()
            return format_response(201, dict(season))
        
        else:
            return format_response(405, {'error': 'Method not allowed'})
    
    finally:
        cursor.close()
        conn.close()

def handle_users_operations(method: str, path: str, body: Dict) -> Dict:
    """Operações CRUD para utilizadores"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('SELECT id, username, email, created_at FROM "user" ORDER BY created_at DESC LIMIT 100;')
            users = cursor.fetchall()
            return format_response(200, [dict(row) for row in users])
        
        elif method == 'POST':
            cursor.execute('''
                INSERT INTO "user" (username, email, password_hash)
                VALUES (%s, %s, %s)
                RETURNING id, username, email;
            ''', (body.get('username'), body.get('email'), body.get('password_hash')))
            
            conn.commit()
            user = cursor.fetchone()
            return format_response(201, dict(user))
        
        else:
            return format_response(405, {'error': 'Method not allowed'})
    
    finally:
        cursor.close()
        conn.close()

def handle_watched_operations(method: str, path: str, body: Dict) -> Dict:
    """Operações para episódios assistidos"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            cursor.execute('SELECT * FROM watched_episode ORDER BY watched_at DESC LIMIT 100;')
            watched = cursor.fetchall()
            return format_response(200, [dict(row) for row in watched])
        
        elif method == 'POST':
            cursor.execute('''
                INSERT INTO watched_episode (user_id, episode_id, watched_at)
                VALUES (%s, %s, NOW())
                RETURNING id, user_id, episode_id, watched_at;
            ''', (body.get('user_id'), body.get('episode_id')))
            
            conn.commit()
            watched = cursor.fetchone()
            
            # Trigger: Publicar notificação se nova série
            try:
                send_notification(f"Novo episódio marcado como assistido: {watched['episode_id']}")
            except:
                logger.warning("Falha ao enviar notificação")
            
            return format_response(201, dict(watched))
        
        else:
            return format_response(405, {'error': 'Method not allowed'})
    
    finally:
        cursor.close()
        conn.close()

def send_notification(message: str) -> None:
    """Enviar notificação via SNS"""
    topic_arn = os.getenv('SNS_TOPIC_ARN')
    if not topic_arn:
        logger.warning("SNS_TOPIC_ARN não configurada")
        return
    
    try:
        response = sns_client.publish(
            TopicArn=topic_arn,
            Message=message,
            Subject='SeriesApp Alert',
            MessageAttributes={
                'notification_type': {
                    'StringValue': 'sms_alert',
                    'DataType': 'String'
                }
            }
        )
        logger.info(f"Notificação enviada: {response['MessageId']}")
    except Exception as e:
        logger.error(f"Erro ao enviar notificação: {str(e)}")

def format_response(status_code: int, body: Any) -> Dict:
    """Formatar resposta HTTP compatível com API Gateway"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        'body': json.dumps(body, default=str)
    }
