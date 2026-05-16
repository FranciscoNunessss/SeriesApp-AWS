from collections.abc import Generator

from sqlalchemy.orm import Session

from app.database import SessionLocal

#teste2
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()