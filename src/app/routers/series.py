from fastapi import APIRouter, Depends, Path, Query, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.series import SeriesCreate, SeriesResponse, SeriesUpdate
from app.services import series_service

router = APIRouter()


@router.get("/", response_model=list[SeriesResponse], summary="List series")
def get_series(
    title: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
):
    return series_service.get_all_series(db, title)


@router.post("/", response_model=SeriesResponse, status_code=status.HTTP_201_CREATED, summary="Create series")
def create_series(payload: SeriesCreate, db: Session = Depends(get_db)):
    return series_service.create_series(db, payload)


@router.get("/{series_id}", response_model=SeriesResponse, summary="Get series by id")
def get_series_by_id(
    series_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return series_service.get_series_by_id(db, series_id)


@router.put("/{series_id}", response_model=SeriesResponse, summary="Update series")
def update_series(
    payload: SeriesUpdate,
    series_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return series_service.update_series(db, series_id, payload)


@router.delete("/{series_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete series")
def delete_series(
    series_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    series_service.delete_series(db, series_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)