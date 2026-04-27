

from datetime import datetime, timezone
from beanie import Document
from pydantic import Field


class Comment(Document):
    postId: str 
    userId: str
    value: str 
    createdAt : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        collection = "comments"