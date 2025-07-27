from pydantic import BaseModel
from datetime import datetime


class CommentCreate(BaseModel):
    content: str


class CommentResponse(BaseModel):
    id: int
    content: str
    author_nickname: str
    created_at: datetime

    class Config:
        orm_mode = True


