from pydantic import BaseModel

# Crete Post
class CreateUpdatePostInterface(BaseModel):
    message:str
    selectedFile:str 
    title:str

# Comment on Post
class CommentPostInterface(BaseModel):
    value:str



