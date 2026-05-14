from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Season(Base):
    __tablename__ = "seasons"
    __table_args__ = (
        UniqueConstraint("series_id", "season_number", name="uq_series_season_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    series_id = Column(Integer, ForeignKey("series.id", ondelete="CASCADE"), nullable=False)
    season_number = Column(Integer, nullable=False)
    release_year = Column(Integer, nullable=True)

    series = relationship("TVSeries", back_populates="seasons")
    episodes = relationship(
        "Episode",
        back_populates="season",
        cascade="all, delete-orphan",
    )