from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.watched_episode import (
    ProgressResponse,
    WatchedEpisodeCreate,
    WatchedEpisodeResponse,
)
from app.services import watched_service

router = APIRouter()


@router.post(
    "/watched-episodes",
    response_model=WatchedEpisodeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mark episode as watched",
)
def mark_watched(payload: WatchedEpisodeCreate, db: Session = Depends(get_db)):
    return watched_service.mark_episode_as_watched(db, payload)


@router.get(
    "/users/{user_id}/history",
    response_model=list[WatchedEpisodeResponse],
    summary="Get user watch history",
)
def get_user_history(
    user_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return watched_service.get_user_history(db, user_id)


@router.get(
    "/users/{user_id}/progress/{series_id}",
    response_model=ProgressResponse,
    summary="Get user progress for series",
)
def get_user_progress(
    user_id: int = Path(..., gt=0),
    series_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return watched_service.get_user_progress_for_series(db, user_id, series_id)