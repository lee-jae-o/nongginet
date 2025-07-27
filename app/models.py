from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, Date
from sqlalchemy.orm import relationship
from datetime import date
from app.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "user_info"

    user_seq = Column(Integer, primary_key=True, autoincrement=True)  
    username = Column(String(50), unique=True, nullable=False)        
    name = Column(String(50), nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    nickname = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Record(Base):
    __tablename__ = "record"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_info.user_seq"), nullable=False)
    record_date = Column(Date, default=date.today, nullable=False)
    pain_level = Column(String(10))
    bowel_count = Column(Integer)
    weight = Column(Integer)
    diet = Column(Text)
    took_medicine = Column(String(10))  
    sleep_hours = Column(Integer)       
    memo = Column(Text)
    user = relationship("User", backref="records")
    

class Board(Base):
    __tablename__ = "board"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("user_info.user_seq"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    views = Column(Integer, default=0)

    author = relationship("User", backref="boards")
    comments = relationship("Comment", back_populates="board", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("user_info.user_seq"), nullable=False)
    board_id = Column(Integer, ForeignKey("board.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    author = relationship("User", backref="comments")
    board = relationship("Board", back_populates="comments")
