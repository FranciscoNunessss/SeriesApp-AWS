from sqlalchemy.orm import Session

from app.exceptions import ResourceNotFoundError
from app.models.series import TVSeries
from app.schemas.series import SeriesCreate, SeriesUpdate


def get_all_series(db: Session, title: str | None = None):
    query = db.query(TVSeries)

    if title:
        query = query.filter(TVSeries.title.ilike(f"%{title.strip()}%"))

    return query.order_by(TVSeries.title.asc()).all()


def get_series_by_id(db: Session, series_id: int):
    series = db.query(TVSeries).filter(TVSeries.id == series_id).first()
    if not series:
        raise ResourceNotFoundError("Series", series_id)
    return series


def create_series(db: Session, payload: SeriesCreate):
    series = TVSeries(**payload.model_dump())
    db.add(series)
    db.commit()
    db.refresh(series)
    return series


def update_series(db: Session, series_id: int, payload: SeriesUpdate):
    series = get_series_by_id(db, series_id)
    data = payload.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(series, field, value)

    db.commit()
    db.refresh(series)
    return series


def delete_series(db: Session, series_id: int):
    series = get_series_by_id(db, series_id)
    db.delete(series)
    db.commit()