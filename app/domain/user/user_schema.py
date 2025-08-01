from pydantic import BaseModel, field_validator, EmailStr
from pydantic_core.core_schema import FieldValidationInfo


class UserCreate(BaseModel):
    username: str
    password1: str
    password2: str
    name: str
    email: EmailStr
    nickname: str


    @field_validator('username', 'password1', 'password2', 'name', 'email', 'nickname')
    def not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('빈 값은 허용되지 않습니다.')
        return v

    @field_validator('password2')
    def passwords_match(cls, v, info: FieldValidationInfo):
        if 'password1' in info.data and v != info.data['password1']:
            raise ValueError('비밀번호가 일치하지 않습니다')
        return v


class Token(BaseModel):
    access_token: str
    token_type: str
    username: str  
    nickname: str

class User(BaseModel):
    user_seq: int
    username: str
    name: str
    email: str
    nickname: str
    created_at: str


    @staticmethod
    def from_orm(user):
        return User(
            user_seq=user.user_seq,
            username=user.username,
            name=user.name,
            email=user.email,
            nickname=user.nickname,
            created_at=user.created_at.strftime("%Y-%m-%d") 
        )
