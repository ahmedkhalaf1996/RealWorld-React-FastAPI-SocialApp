from typing import Any, Dict, Optional
from fastapi import APIRouter, status, Request, Query
from fastapi.responses import JSONResponse

from services.notifyService import NotifiationService

NotificationRouter = APIRouter()


@NotificationRouter.get("/mark-notification-asreaded")
async def mark_notification_as_readed(id: str = Query(...)):
    try: 
        await  NotifiationService.mark_not_as_readed(id)
        return JSONResponse(content={"message": "Notification maked as read"}, status_code=200)
    except Exception as e:
        print(e)
        return JSONResponse(content={"message": "Internal server error"}, status_code=500)

@NotificationRouter.get("/{userid}")
async def get_user_notification(userid: str):
    try:
        return await NotifiationService.get_user_notification(userid)
    except Exception as e:
        print(e)
        return JSONResponse(content={"message": "Internal server error"}, status_code=500)
 