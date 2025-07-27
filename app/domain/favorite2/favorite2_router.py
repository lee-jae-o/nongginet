from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.domain.favorite2.favorite2_model import Favorite2
from app.domain.favorite2.favorite2_schema import Favorite2AddRequest, Favorite2Response
from app.domain.user.user_router import get_current_user
from app.models import User
from typing import List

router = APIRouter(
    prefix="/api/favorite2",
    tags=["즐겨찾기(구매정보)"]
)

@router.post("/add", status_code=201)
def add_favorite2(
    request: Favorite2AddRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Favorite2).filter_by(
        user_id=current_user.user_seq,
        item_id=request.item_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="이미 즐겨찾기에 등록된 항목입니다.")

    new_fav = Favorite2(
        user_id=current_user.user_seq,
        item_id=request.item_id,
        item_name=request.item_name,
        manufacturer=request.manufacturer
    )
    db.add(new_fav)
    db.commit()
    return {"message": "즐겨찾기에 추가되었습니다."}

@router.delete("/remove/{item_id}")
def remove_favorite2(
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorite = db.query(Favorite2).filter_by(
        user_id=current_user.user_seq,
        item_id=item_id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="즐겨찾기에 등록된 항목이 아닙니다.")

    db.delete(favorite)
    db.commit()
    return {"message": "즐겨찾기에서 삭제되었습니다."}

@router.get("/list", response_model=list[Favorite2Response])
def get_favorites2(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorites = db.query(Favorite2).filter_by(user_id=current_user.user_seq).all()
    return favorites



@router.get("/list", response_model=List[Favorite2Response])
def get_favorites2(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favorites = db.query(Favorite2).filter_by(user_id=current_user.user_seq).all()
    return favorites