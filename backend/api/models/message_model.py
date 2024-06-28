from beanie import Document

class Message(Document):
    content: str
    sender: str
    recever: str
    class Settings:
        collection = "messages"