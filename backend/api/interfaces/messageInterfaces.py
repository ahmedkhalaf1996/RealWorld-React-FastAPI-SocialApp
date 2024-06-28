from pydantic import BaseModel

class MessageRequest(BaseModel):
    content: str
    sender: str
    recever: str