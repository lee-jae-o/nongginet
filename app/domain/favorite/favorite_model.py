from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.database import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_info.user_seq", ondelete="CASCADE"))
    type = Column(String(50), default="rental") 
    item_id = Column(String(255))               
    item_name = Column(String(255))            
    address = Column(String(255))               

    __table_args__ = (
        UniqueConstraint('user_id', 'type', 'item_id', name='unique_favorite'),
    )
