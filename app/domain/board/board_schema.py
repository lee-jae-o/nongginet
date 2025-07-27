from pydantic import BaseModel
from datetime import datetime


class BoardCreate(BaseModel):
    title: str
    content: str


class BoardResponse(BaseModel):
    id: int
    title: str
    content: str
    author_nickname: str
    created_at: datetime
    views: int = 0

    class Config:
        orm_mode = True
