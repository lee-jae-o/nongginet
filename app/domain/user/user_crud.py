from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.domain.user.user_schema import UserCreate
from app.models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db: Session, user_create: UserCreate):
    db_user = User(
        username=user_create.username,
        password=pwd_context.hash(user_create.password1),
        name=user_create.name,
        email=user_create.email,
        nickname=user_create.nickname
    )
    db.add(db_user)
    db.commit()


def get_existing_user(db: Session, user_create: UserCreate):
    return db.query(User).filter(
        (User.username == user_create.username) |
        (User.email == user_create.email) |
        (User.nickname == user_create.nickname)

    ).first()


def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()
