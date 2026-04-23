from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from beanie import Document

class UserInSchema(BaseModel):
    name: str
    avatar : Optional[str] = None

class Notification(Document):
    deatils: str
    mainuid: str
    targetid: str
    isreded: bool = False
    createdAt : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: UserInSchema
    class Settings:
        collection = "notifications"



# up







