from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.domain.comment import comment_crud, comment_schema
from app.domain.user.user_router import get_current_user

router = APIRouter(
    prefix="/api/comments",
    tags=["Comments"]
)


@router.post("/{board_id}", response_model=comment_schema.CommentResponse)
def create_comment(
    board_id: int,
    comment_create: comment_schema.CommentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_comment = comment_crud.create_comment(db, comment_create, current_user.user_seq, board_id)
    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "author_nickname": current_user.nickname,
        "created_at": new_comment.created_at
    }


@router.get("/{board_id}", response_model=list[comment_schema.CommentResponse])
def get_comments(board_id: int, db: Session = Depends(get_db)):
    comments = comment_crud.get_comments_by_board(db, board_id)
    return [
        {
            "id": comment.id,
            "content": comment.content,
            "author_nickname": comment.author.nickname,
            "created_at": comment.created_at
        }
        for comment in comments
    ]


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    deleted = comment_crud.delete_comment(db, comment_id, current_user.user_seq)
    if not deleted:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없거나 삭제 권한이 없습니다.")
    


@router.put("/{comment_id}", response_model=comment_schema.CommentResponse)
def update_comment(
    comment_id: int,
    comment_update: comment_schema.CommentCreate,  
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    updated_comment = comment_crud.update_comment(db, comment_id, comment_update.content, current_user.user_seq)
    if not updated_comment:
        raise HTTPException(status_code=404, detail="댓글을 찾을 수 없거나 수정 권한이 없습니다.")
    
    return {
        "id": updated_comment.id,
        "content": updated_comment.content,
        "author_nickname": current_user.nickname,
        "created_at": updated_comment.created_at
    }    






