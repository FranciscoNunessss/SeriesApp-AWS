from fastapi import APIRouter, Depends, Path, Response, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.episode import EpisodeCreate, EpisodeResponse, EpisodeUpdate
from app.services import episode_service

router = APIRouter()


@router.get("/seasons/{season_id}/episodes", response_model=list[EpisodeResponse], summary="List episodes by season")
def get_season_episodes(
    season_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return episode_service.get_season_episodes(db, season_id)


@router.post(
    "/seasons/{season_id}/episodes",
    response_model=EpisodeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create episode",
)
def create_episode(
    payload: EpisodeCreate,
    season_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return episode_service.create_episode(db, season_id, payload)


@router.get("/episodes/{episode_id}", response_model=EpisodeResponse, summary="Get episode by id")
def get_episode(
    episode_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return episode_service.get_episode_by_id(db, episode_id)


@router.put("/episodes/{episode_id}", response_model=EpisodeResponse, summary="Update episode")
def update_episode(
    payload: EpisodeUpdate,
    episode_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return episode_service.update_episode(db, episode_id, payload)


@router.delete("/episodes/{episode_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete episode")
def delete_episode(
    episode_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    episode_service.delete_episode(db, episode_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)