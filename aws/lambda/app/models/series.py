from sqlalchemy import Column, DateTime, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.database import Base


class TVSeries(Base):
    __tablename__ = "series"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=True)
    genre = Column(String(50), nullable=True)
    release_year = Column(Integer, nullable=True)
    status = Column(String(30), nullable=True)
    total_seasons = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    seasons = relationship(
        "Season",
        back_populates="series",
        cascade="all, delete-orphan",
    )