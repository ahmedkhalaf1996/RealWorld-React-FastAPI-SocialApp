import beanie
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from models.users_model import User
from models.posts_model import Post
from models.message_model import Message
from models.unReadedmsg_model import UnReadedMsg
from models.notificaion_model import Notification
async def init_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await init_beanie(
        database=client.social,
        document_models=[User,Post, Message, UnReadedMsg , Notification]
    )


