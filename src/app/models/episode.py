from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Episode(Base):
    __tablename__ = "episodes"
    __table_args__ = (
        UniqueConstraint("season_id", "episode_number", name="uq_season_episode_number"),
    )

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id", ondelete="CASCADE"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String(150), nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    synopsis = Column(Text, nullable=True)

    season = relationship("Season", back_populates="episodes")
    watched_by_users = relationship(
        "WatchedEpisode",
        back_populates="episode",
        cascade="all, delete-orphan",
    )