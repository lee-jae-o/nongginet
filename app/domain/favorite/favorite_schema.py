from pydantic import BaseModel

class FavoriteAddRequest(BaseModel):
    type: str  
    item_id: str
    item_name: str
    address: str

class FavoriteResponse(BaseModel):
    id: int
    type: str
    item_id: str
    item_name: str
    address: str
