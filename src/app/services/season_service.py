from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import DuplicateResourceError, ResourceNotFoundError
from app.models.season import Season
from app.models.series import TVSeries
from app.schemas.season import SeasonCreate, SeasonUpdate


def get_series_seasons(db: Session, series_id: int):
    series = db.query(TVSeries).filter(TVSeries.id == series_id).first()
    if not series:
        raise ResourceNotFoundError("Series", series_id)

    return (
        db.query(Season)
        .filter(Season.series_id == series_id)
        .order_by(Season.season_number.asc())
        .all()
    )


def get_season_by_id(db: Session, season_id: int):
    season = db.query(Season).filter(Season.id == season_id).first()
    if not season:
        raise ResourceNotFoundError("Season", season_id)
    return season


def create_season(db: Session, series_id: int, payload: SeasonCreate):
    series = db.query(TVSeries).filter(TVSeries.id == series_id).first()
    if not series:
        raise ResourceNotFoundError("Series", series_id)

    season = Season(series_id=series_id, **payload.model_dump())
    db.add(season)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateResourceError("Season number already exists for this series")

    db.refresh(season)
    return season


def update_season(db: Session, season_id: int, payload: SeasonUpdate):
    season = get_season_by_id(db, season_id)
    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(season, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise DuplicateResourceError("Season number already exists for this series")

    db.refresh(season)
    return season


def delete_season(db: Session, season_id: int):
    season = get_season_by_id(db, season_id)
    db.delete(season)
    db.commit()