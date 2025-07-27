from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.database import Base

class Favorite2(Base):
    __tablename__ = "favorites2"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_info.user_seq", ondelete="CASCADE"))
    item_id = Column(String(255))  
    item_name = Column(String(255))  
    manufacturer = Column(String(255)) 

    __table_args__ = (
        UniqueConstraint('user_id', 'item_id', name='unique_favorite2'),
    )






