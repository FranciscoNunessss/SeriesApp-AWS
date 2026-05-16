from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import relationship

from app.database import Base


class WatchedEpisode(Base):
    __tablename__ = "watched_episodes"
    __table_args__ = (
        UniqueConstraint("user_id", "episode_id", name="uq_user_episode"),
        CheckConstraint("rating >= 1 AND rating <= 10", name="ck_rating_between_1_10"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    episode_id = Column(Integer, ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False)
    watched_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    rating = Column(Integer, nullable=True)

    user = relationship("User", back_populates="watched_episodes")
    episode = relationship("Episode", back_populates="watched_by_users")