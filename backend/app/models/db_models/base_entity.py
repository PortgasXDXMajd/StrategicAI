import datetime
from uuid import uuid4
from pydantic import BaseModel, Field

class BaseEntity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()), alias="_id")
    created_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    modified_at: datetime.datetime = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))

    class Config:
        arbitrary_types_allowed = True
        from_attributes = True
