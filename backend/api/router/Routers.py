
from fastapi import APIRouter
from router.users import UserRouter
from router.posts import PostRouter
from router.chat import ChatRouter
from router.notify import NotificationRouter
router = APIRouter()

router.include_router(UserRouter, prefix='/user', tags=["users"])
router.include_router(PostRouter, prefix='/posts', tags=["posts"])
router.include_router(ChatRouter, prefix='/chat', tags=["chat"])
router.include_router(NotificationRouter, prefix='/notification', tags=["notification"])
