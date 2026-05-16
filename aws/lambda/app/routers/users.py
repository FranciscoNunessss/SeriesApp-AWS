from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services import user_service

router = APIRouter()


@router.get("/", response_model=list[UserResponse], summary="List all users")
def get_users(db: Session = Depends(get_db)):
    return user_service.get_all_users(db)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Create user")
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, payload)


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by id")
def get_user(
    user_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return user_service.get_user_by_id(db, user_id)


@router.put("/{user_id}", response_model=UserResponse, summary="Update user")
def update_user(
    payload: UserUpdate,
    user_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
):
    return user_service.update_user(db, user_id, payload)