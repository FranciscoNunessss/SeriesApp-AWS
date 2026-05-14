from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import DuplicateResourceError, ResourceNotFoundError
from app.models.episode import Episode
from app.models.season import Season
from app.models.series import TVSeries
from app.models.user import User
from app.models.watched_episode import WatchedEpisode
from app.schemas.watched_episode import WatchedEpisodeCreate


def mark_episode_as_watched(db: Session, payload: WatchedEpisodeCreate):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise ResourceNotFoundError("User", payload.user_id)

    episode = db.query(Episode).filter(Episode.id == payload.episode_id).first()
    if not episode:
        raise ResourceNotFoundError("Episode", payload.episode_id)

    watched = WatchedEpisode(**payload.model_dump())
    db.add(watched)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateResourceError("This user has already marked this episode as watched")

    db.refresh(watched)
    return watched


def get_user_history(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError("User", user_id)

    return (
        db.query(WatchedEpisode)
        .filter(WatchedEpisode.user_id == user_id)
        .order_by(WatchedEpisode.watched_at.desc())
        .all()
    )


def get_user_progress_for_series(db: Session, user_id: int, series_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError("User", user_id)

    series = db.query(TVSeries).filter(TVSeries.id == series_id).first()
    if not series:
        raise ResourceNotFoundError("Series", series_id)

    total_episodes = (
        db.query(func.count(Episode.id))
        .join(Season, Episode.season_id == Season.id)
        .filter(Season.series_id == series_id)
        .scalar()
    ) or 0

    watched_episodes = (
        db.query(func.count(WatchedEpisode.id))
        .join(Episode, WatchedEpisode.episode_id == Episode.id)
        .join(Season, Episode.season_id == Season.id)
        .filter(
            WatchedEpisode.user_id == user_id,
            Season.series_id == series_id,
        )
        .scalar()
    ) or 0

    progress_percent = round((watched_episodes / total_episodes) * 100, 2) if total_episodes > 0 else 0.0

    return {
        "user_id": user_id,
        "series_id": series_id,
        "total_episodes": total_episodes,
        "watched_episodes": watched_episodes,
        "progress_percent": progress_percent,
    }