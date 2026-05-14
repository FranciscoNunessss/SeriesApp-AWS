from fastapi import APIRouter, Depends, Path, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.season import SeasonCreate, SeasonResponse, SeasonUpdate
from app.services import season_service

router = APIRouter()


@router.get("/series/{series_id}/seasons", response_model=list[SeasonResponse], summary="List seasons by series")
def get_series_seasons(
    series_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return season_service.get_series_seasons(db, series_id)


@router.post(
    "/series/{series_id}/seasons",
    response_model=SeasonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create season",
)
def create_season(
    payload: SeasonCreate,
    series_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return season_service.create_season(db, series_id, payload)


@router.get("/seasons/{season_id}", response_model=SeasonResponse, summary="Get season by id")
def get_season(
    season_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return season_service.get_season_by_id(db, season_id)


@router.put("/seasons/{season_id}", response_model=SeasonResponse, summary="Update season")
def update_season(
    payload: SeasonUpdate,
    season_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return season_service.update_season(db, season_id, payload)


@router.delete("/seasons/{season_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete season")
def delete_season(
    season_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    season_service.delete_season(db, season_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)