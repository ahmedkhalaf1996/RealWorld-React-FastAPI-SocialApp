from typing import List, Optional
from uuid import UUID

from beanie import Document, Indexed
from pydantic import Field, EmailStr

import pymongo

class User(Document):
    name : str
    email: Indexed(EmailStr, unique=True) # type: ignore
    password: str
    bio:Optional[str] = Field(default="")
    imageUrl:Optional[str] = Field(default=None)
    followers:Optional[List[str]] = Field(default=[])
    following:Optional[List[str]] = Field(default=[])
    
    class Settings:
        collection = "users"
        indexes = [[("name", pymongo.TEXT), ("email", pymongo.TEXT)]]




