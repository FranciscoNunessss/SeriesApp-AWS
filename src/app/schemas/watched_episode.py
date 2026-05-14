from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WatchedEpisodeCreate(BaseModel):
    user_id: int = Field(..., gt=0)
    episode_id: int = Field(..., gt=0)
    rating: int | None = Field(default=None, ge=1, le=10)


class WatchedEpisodeResponse(BaseModel):
    id: int
    user_id: int
    episode_id: int
    watched_at: datetime
    rating: int | None = None

    model_config = ConfigDict(from_attributes=True)


class ProgressResponse(BaseModel):
    user_id: int
    series_id: int
    total_episodes: int
    watched_episodes: int
    progress_percent: float