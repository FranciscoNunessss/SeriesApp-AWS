from sqlalchemy.orm import Session

from app.exceptions import DuplicateResourceError, ResourceNotFoundError
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def get_all_users(db: Session):
    return db.query(User).order_by(User.id.asc()).all()


def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError("User", user_id)
    return user


def create_user(db: Session, payload: UserCreate):
    existing_username = db.query(User).filter(User.username == payload.username).first()
    if existing_username:
        raise DuplicateResourceError("Username already exists")

    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise DuplicateResourceError("Email already exists")

    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, payload: UserUpdate):
    user = get_user_by_id(db, user_id)
    data = payload.model_dump(exclude_unset=True)

    if "username" in data:
        existing_username = (
            db.query(User)
            .filter(User.username == data["username"], User.id != user_id)
            .first()
        )
        if existing_username:
            raise DuplicateResourceError("Username already exists")

    if "email" in data:
        existing_email = (
            db.query(User)
            .filter(User.email == data["email"], User.id != user_id)
            .first()
        )
        if existing_email:
            raise DuplicateResourceError("Email already exists")

    for field, value in data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user