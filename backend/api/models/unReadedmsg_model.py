from beanie import Document

class UnReadedMsg(Document):
    mainUserid: str
    otherUserid: str
    numOfUnreadedMessages: int 
    isReaded: bool
    class Settings:
        collection = "unreadedmsg"