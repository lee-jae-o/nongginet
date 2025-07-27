from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.domain.board import board_crud, board_schema
from app.domain.user.user_router import get_current_user
from app.models import Board, User

router = APIRouter(
    prefix="/api/board",
    tags=["Board"]
)


@router.post("", response_model=board_schema.BoardResponse)
def create_board(
    board_create: board_schema.BoardCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_board = board_crud.create_board(db, board_create, current_user.user_seq)
    return {
        "id": new_board.id,
        "title": new_board.title,
        "content": new_board.content,
        "author_nickname": current_user.nickname,
        "created_at": new_board.created_at
    }


@router.get("", response_model=list[board_schema.BoardResponse])
def get_boards(
    db: Session = Depends(get_db),
    skip: int = Query(0, description="페이지네이션 시작점"),
    limit: int = Query(3, description="한 페이지에 보여줄 개수")
):
    boards = db.query(Board).options(joinedload(Board.author)).order_by(Board.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for board in boards:
        result.append({
            "id": board.id,
            "title": board.title,
            "content": board.content,
            "author_nickname": board.author.nickname,
            "created_at": board.created_at,
            "views": board.views if board.views is not None else 0 
        })
    return result


@router.get("/total")
def get_total_boards(db: Session = Depends(get_db)):
    total = db.query(Board).count()
    return {"total": total}


@router.get("/{board_id}", response_model=board_schema.BoardResponse)
def get_board(
    board_id: int,
    db: Session = Depends(get_db)
):
    board = board_crud.get_board(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    
    return {
        "id": board.id,
        "title": board.title,
        "content": board.content,
        "author_nickname": board.author.nickname,
        "created_at": board.created_at,
        "views": board.views if board.views is not None else 0
    }


@router.put("/{board_id}", response_model=board_schema.BoardResponse)
def update_board(
    board_id: int,
    board_update: board_schema.BoardCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    updated_board = board_crud.update_board(db, board_id, board_update, current_user.user_seq)
    if not updated_board:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없거나 권한이 없습니다.")
    return {
        "id": updated_board.id,
        "title": updated_board.title,
        "content": updated_board.content,
        "author_nickname": current_user.nickname,
        "created_at": updated_board.created_at,
        "views": updated_board.views
    }


@router.delete("/{board_id}")
def delete_board(
    board_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    success = board_crud.delete_board(db, board_id, current_user.user_seq)
    if not success:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없거나 권한이 없습니다.")
    return {"message": "게시글이 삭제되었습니다."}








