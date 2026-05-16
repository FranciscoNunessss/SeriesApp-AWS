import logging
import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError

from app.config import settings

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,  # Reciclar conexões a cada hora (importante para Lambda)
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def init_db_with_retry(max_attempts: int = 20, delay_seconds: int = 2) -> None:
    """
    Inicializar database com retry logic.
    Importante para Lambda em VPC que precisa de tempo para conectar ao RDS.
    """
    for attempt in range(1, max_attempts + 1):
        try:
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            Base.metadata.create_all(bind=engine)
            logger.info("Database connection established and schema initialized")
            return
        except OperationalError as exc:
            if attempt == max_attempts:
                logger.exception("Database is unavailable after retries")
                raise
            logger.warning(
                "Database not ready yet (attempt %s/%s): %s",
                attempt,
                max_attempts,
                exc,
            )
            time.sleep(delay_seconds)


