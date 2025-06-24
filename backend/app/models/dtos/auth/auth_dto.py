from pydantic import BaseModel, EmailStr, Field


class AuthDto(BaseModel):
    email: EmailStr = Field()
    password: str = Field()
