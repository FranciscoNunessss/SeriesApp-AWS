import boto3
import json
import logging
from datetime import datetime, timedelta
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sns_client = boto3.client('sns')

def lambda_handler(event, context):
    """
    Lambda handler para verificação diária de notificações
    Acionado por EventBridge a cada dia às 09:00 UTC
    """
    try:
        logger.info("Daily notification check iniciado")
        
        # Verificar regra: e.g., novos episódios disponíveis
        # Esta é uma implementação simplificada
        # Em produção, isso incluiria lógica mais complexa
        
        check_new_series_alerts()
        check_new_episodes_alerts()
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Daily notification check completed',
                'timestamp': datetime.now().isoformat()
            })
        }
    
    except Exception as e:
        logger.error(f"Erro em daily notification check: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def check_new_series_alerts():
    """Verificar novas séries adicionadas no último dia"""
    logger.info("Verificando novas séries...")
    
    # TODO: Implementar lógica de verificação com BD
    # Pseudocódigo:
    # - Conectar à base de dados
    # - Query: SELECT COUNT(*) FROM series WHERE created_at > NOW() - INTERVAL 1 DAY
    # - Se count > 0, enviar SMS
    
    message = "Nova série disponível! Consulta a app para mais detalhes."
    send_sms_notification(message)

def check_new_episodes_alerts():
    """Verificar novos episódios lançados no último dia"""
    logger.info("Verificando novos episódios...")
    
    # TODO: Implementar lógica de verificação com BD
    # Pseudocódigo:
    # - Conectar à base de dados
    # - Query: SELECT COUNT(*) FROM episode WHERE created_at > NOW() - INTERVAL 1 DAY
    # - Se count > 0, enviar SMS
    
    message = "Novos episódios disponíveis!"
    send_sms_notification(message)

def send_sms_notification(message: str) -> None:
    """Enviar notificação SMS via SNS"""
    topic_arn = os.getenv('SNS_TOPIC_ARN')
    
    if not topic_arn:
        logger.warning("SNS_TOPIC_ARN não configurada")
        return
    
    try:
        response = sns_client.publish(
            TopicArn=topic_arn,
            Message=message,
            Subject='SeriesApp Daily Alert',
            MessageAttributes={
                'notification_type': {
                    'StringValue': 'sms_alert',
                    'DataType': 'String'
                }
            }
        )
        logger.info(f"SMS enviado com sucesso: {response['MessageId']}")
    except Exception as e:
        logger.error(f"Erro ao enviar SMS: {str(e)}")
