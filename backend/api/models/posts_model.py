from typing import List, Optional
from datetime import datetime, timezone
from beanie import Document
from pydantic import Field
import pymongo

class Post(Document):
    title: Optional[str]
    message: Optional[str]
    creator: Optional[str]
    selectedFile: Optional[str]
    likes: Optional[List[str]] = Field(default=[])
    createdAt : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    class Settings:
        collection = "posts"
        indexes = [
            [("title", pymongo.TEXT), ("message", pymongo.TEXT)]
        ]   

# up





