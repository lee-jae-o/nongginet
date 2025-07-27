from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.domain.favorite.favorite_model import Favorite
from app.domain.favorite.favorite_schema import FavoriteAddRequest, FavoriteResponse
from app.domain.user.user_router import get_current_user
from app.models import User

router = APIRouter(
    prefix="/api/favorite",
    tags=["즐겨찾기"]
)

@router.post("/add", status_code=201)
def add_favorite(
    request: FavoriteAddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Favorite).filter_by(
        user_id=current_user.user_seq,
        type=request.type,
        item_id=request.item_id
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="이미 즐겨찾기에 등록된 항목입니다.")

    new_fav = Favorite(
        user_id=current_user.user_seq,
        type=request.type,
        item_id=request.item_id,
        item_name=request.item_name,
        address=request.address
    )
    db.add(new_fav)
    db.commit()
    return {"message": "즐겨찾기에 추가되었습니다."}

@router.delete("/remove/{type}/{item_id}")
def remove_favorite(
    type: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorite = db.query(Favorite).filter_by(
        user_id=current_user.user_seq,
        type=type,
        item_id=item_id
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="즐겨찾기에 등록된 항목이 아닙니다.")

    db.delete(favorite)
    db.commit()
    return {"message": "즐겨찾기에서 삭제되었습니다."}

@router.get("/list", response_model=list[FavoriteResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorites = db.query(Favorite).filter_by(user_id=current_user.user_seq).all()
    return favorites
