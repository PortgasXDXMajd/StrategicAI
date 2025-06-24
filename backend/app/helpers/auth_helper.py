import os
import datetime
from jose import JWTError
from jose import jwt as j
from pydantic import ValidationError
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime, timezone, timedelta
from app.helpers.response_helper import ResponseModel
from app.repositories.company_repo import CompanyRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
company_repo = CompanyRepository()

async def get_caller(token: str = Depends(oauth2_scheme)):
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"

    credentials_exception = ResponseModel(message="Unauthorized", result=401, body=None)
    unath_exception = HTTPException(status_code=401, detail=credentials_exception.model_dump())
    try:
        payload = j.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        company_id: str = payload.get("sub")
        expiration: datetime = payload.get("exp")
        if company_id is None or datetime.now(timezone.utc).timestamp() >= expiration:
            raise unath_exception

    except (JWTError, ValidationError):
        raise unath_exception

    caller = await company_repo.get_by_id(company_id)
    if caller is None:
        raise HTTPException(status_code=401, detail="Company not found")
    return caller


def create_access_token(data: dict, expires_delta: timedelta = None):
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = "HS256"

    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = j.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
