from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from beanie import Document

class UserInSchema(BaseModel):
    name: str
    avatar : Optional[str] = None

class Notification(Document):
    deatils: str
    mainuid: str
    targetid: str
    isreded: bool = False
    createdAt : datetime = Field(default_factory=datetime.utcnow)

    user: UserInSchema
    class Settings:
        collection = "notifications"











