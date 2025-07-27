from sqlalchemy.orm import Session
from app.models import Board, User
from app.domain.board.board_schema import BoardCreate


def create_board(db: Session, board_create: BoardCreate, user_id: int):
    new_board = Board(
        title=board_create.title,
        content=board_create.content,
        author_id=user_id
    )
    db.add(new_board)
    db.commit()
    db.refresh(new_board)
    return new_board


def get_boards(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Board).offset(skip).limit(limit).all()


def get_board(db: Session, board_id: int):
    board = db.query(Board).filter(Board.id == board_id).first()
    if board:
        board.views += 1  
        db.commit()
        db.refresh(board)
    return board


def update_board(db: Session, board_id: int, board_update: BoardCreate, user_id: int):
    board = db.query(Board).filter(Board.id == board_id, Board.author_id == user_id).first()
    if not board:
        return None
    board.title = board_update.title
    board.content = board_update.content
    db.commit()
    db.refresh(board)
    return board


def delete_board(db: Session, board_id: int, user_id: int):
    board = db.query(Board).filter(Board.id == board_id, Board.author_id == user_id).first()
    if not board:
        return False
    db.delete(board)
    db.commit()
    return True