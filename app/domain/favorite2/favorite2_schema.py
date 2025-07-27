from pydantic import BaseModel

class Favorite2AddRequest(BaseModel):
    item_id: str
    item_name: str
    manufacturer: str

class Favorite2Response(BaseModel):
    id: int
    item_id: str
    item_name: str
    manufacturer: str