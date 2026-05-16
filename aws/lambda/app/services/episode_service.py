from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import DuplicateResourceError, ResourceNotFoundError
from app.models.episode import Episode
from app.models.season import Season
from app.schemas.episode import EpisodeCreate, EpisodeUpdate


def get_season_episodes(db: Session, season_id: int):
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise ResourceNotFoundError("Season", season_id)

    return (
        db.query(Episode)
        .filter(Episode.season_id == season_id)
        .order_by(Episode.episode_number.asc())
        .all()
    )


def get_episode_by_id(db: Session, episode_id: int):
    episode = db.query(Episode).filter(Episode.id == episode_id).first()
    if not episode:
        raise ResourceNotFoundError("Episode", episode_id)
    return episode


def create_episode(db: Session, season_id: int, payload: EpisodeCreate):
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise ResourceNotFoundError("Season", season_id)

    episode = Episode(season_id=season_id, **payload.model_dump())
    db.add(episode)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateResourceError("Episode number already exists for this season")

    db.refresh(episode)
    return episode


def update_episode(db: Session, episode_id: int, payload: EpisodeUpdate):
    episode = get_episode_by_id(db, episode_id)
    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(episode, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateResourceError("Episode number already exists for this season")

    db.refresh(episode)
    return episode


def delete_episode(db: Session, episode_id: int):
    episode = get_episode_by_id(db, episode_id)
    db.delete(episode)
    db.commit()