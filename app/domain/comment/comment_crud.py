from sqlalchemy.orm import Session
from app.models import Comment, User
from app.domain.comment.comment_schema import CommentCreate


def create_comment(db: Session, comment_create: CommentCreate, user_id: int, board_id: int):
    new_comment = Comment(
        content=comment_create.content,
        author_id=user_id,
        board_id=board_id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment


def get_comments_by_board(db: Session, board_id: int):
    return db.query(Comment).filter(Comment.board_id == board_id).all()


def delete_comment(db: Session, comment_id: int, user_id: int) -> bool:
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.author_id == user_id).first()
    
    if not comment:
        return False

    db.delete(comment)
    db.commit()
    return True


def update_comment(db: Session, comment_id: int, content: str, user_id: int):
    comment = db.query(Comment).filter(Comment.id == comment_id, Comment.author_id == user_id).first()

    if not comment:
        return None
    
    comment.content = content
    db.commit()
    db.refresh(comment)
    return comment

