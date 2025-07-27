from datetime import timedelta, datetime
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from starlette import status
from pydantic import BaseModel
from app.database import get_db
from app.domain.user import user_crud, user_schema
from app.domain.user.user_crud import pwd_context
from app.models import User, Board, Comment, Record
from app.domain.user.user_schema import User as UserSchema
from passlib.context import CryptContext
from fastapi import Depends
from app.models import User, Board, Comment, Record
from fastapi import Query
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
ALGORITHM = os.getenv("ALGORITHM")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/user/login")


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


router = APIRouter(
    prefix="/api/user",
    tags=["User"]
)

@router.post("/create", status_code=status.HTTP_204_NO_CONTENT)
def user_create(_user_create: user_schema.UserCreate, db: Session = Depends(get_db)):
    user = user_crud.get_existing_user(db, user_create=_user_create)
    if user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="이미 존재하는 사용자입니다.")
    user_crud.create_user(db=db, user_create=_user_create)

@router.post("/login", response_model=user_schema.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(),
                           db: Session = Depends(get_db)):

    user = user_crud.get_user(db, username=form_data.username)
    if not user or not pwd_context.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    data = {
        "sub": user.username,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    access_token = jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "nickname": user.nickname
    }

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = user_crud.get_user(db, username=username)
    if user is None:
        raise credentials_exception
    return user


class FindIdRequest(BaseModel):
    email: str
    name: str

@router.post("/find-id")
def find_id(request: FindIdRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email, User.name == request.name).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="입력한 정보와 일치하는 아이디가 없습니다.")
    return {"username": user.username}

class FindPasswordRequest(BaseModel):
    username: str
    email: str

@router.post("/find-password")
def find_password(request: FindPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username, User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="입력한 정보와 일치하는 계정이 없습니다.")
    
    return {"message": "사용자 확인됨. 비밀번호 재설정 페이지로 이동하세요."}

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str
    

@router.post("/reset-password")
def reset_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="사용자를 찾을 수 없습니다.")

    user.password = pwd_context.hash(request.new_password)
    db.commit()

    return {"message": "비밀번호가 성공적으로 변경되었습니다."}


@router.post("/check-username")
def check_username(request: dict, db: Session = Depends(get_db)):
    username = request.get("username")
    user = db.query(User).filter(User.username == username).first()
    if user:
        raise HTTPException(status_code=409, detail="Username already exists")
    return {"message": "Username is available"}

@router.post("/check-email")
def check_email(request: dict, db: Session = Depends(get_db)):
    email = request.get("email")
    user = db.query(User).filter(User.email == email).first()
    if user:
        raise HTTPException(status_code=409, detail="Email already exists")
    return {"message": "Email is available"}


@router.get("/mypage", response_model=user_schema.User)
def get_my_page(current_user: User = Depends(get_current_user)):
    return user_schema.User.from_orm(current_user)


@router.post("/check-nickname")
def check_nickname(request: dict, db: Session = Depends(get_db)):
    nickname = request.get("nickname")
    user = db.query(User).filter(User.nickname == nickname).first()
    if user:
        raise HTTPException(status_code=409, detail="이미 존재하는 닉네임입니다.")
    return {"message": "사용 가능한 닉네임입니다."}


@router.put("/update", response_model=UserSchema)
def update_user_info(request: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    name = request.get("name")
    nickname = request.get("nickname")

    if name:
        current_user.name = name
    if nickname:
        current_user.nickname = nickname

    db.commit()
    db.refresh(current_user)

    return UserSchema.from_orm(current_user)


@router.delete("/delete")
def delete_user(request: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    password = request.get("password")

    if not pwd_context.verify(password, current_user.password):
        raise HTTPException(status_code=403, detail="비밀번호가 일치하지 않습니다.")

    try:
        board_ids = db.query(Board.id).filter(Board.author_id == current_user.user_seq).all()
        board_ids = [board.id for board in board_ids]

        if board_ids:
            db.query(Comment).filter(Comment.board_id.in_(board_ids)).delete(synchronize_session=False)
        db.query(Comment).filter(Comment.author_id == current_user.user_seq).delete(synchronize_session=False)
        db.query(Board).filter(Board.author_id == current_user.user_seq).delete(synchronize_session=False)
        db.query(Record).filter(Record.user_id == current_user.user_seq).delete(synchronize_session=False)
        db.delete(current_user)
        db.commit()

        return {"message": "회원탈퇴가 완료되었습니다."}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 중 오류가 발생했습니다: {str(e)}")


@router.get("/my-posts")
def get_my_posts(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, description="페이지네이션 시작점"),
    limit: int = Query(10, description="한 페이지에 보여줄 개수")
):
    posts = db.query(Board).filter(Board.author_id == current_user.user_seq).order_by(Board.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for post in posts:
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,  
            "created_at": post.created_at.strftime("%Y-%m-%d %H:%M"),
            "views": post.views if post.views else 0
        })
    
    return result


@router.get("/my-comments")
def get_my_comments(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, description="페이지네이션 시작점"),
    limit: int = Query(10, description="한 페이지에 보여줄 개수")
):
    comments = (db.query(Comment)
                .join(Board, Comment.board_id == Board.id)
                .filter(Comment.author_id == current_user.user_seq)
                .order_by(Comment.created_at.desc())
                .offset(skip)
                .limit(limit)
                .all())
    
    result = []
    for comment in comments:
        result.append({
            "id": comment.id,
            "content": comment.content[:50] + "..." if len(comment.content) > 50 else comment.content, 
            "created_at": comment.created_at.strftime("%Y-%m-%d %H:%M"),
            "board_id": comment.board_id,
            "board_title": comment.board.title  
        })
    
    return result


@router.get("/my-stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post_count = db.query(Board).filter(Board.author_id == current_user.user_seq).count()
    comment_count = db.query(Comment).filter(Comment.author_id == current_user.user_seq).count()
    
    return {
        "post_count": post_count,
        "comment_count": comment_count
    }


