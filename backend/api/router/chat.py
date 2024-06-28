from typing import Optional
from fastapi import APIRouter, HTTPException,Query, Response, Request
from fastapi.responses import JSONResponse
from services.chatService import ChatService
from interfaces.messageInterfaces import MessageRequest

ChatRouter = APIRouter()

@ChatRouter.post('/sendmessage')
async def send_message(data: MessageRequest):
    try : 
        return await ChatService.send_message(data)
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"message":"unable to SendMessage!"}
        )



@ChatRouter.get('/getmsgsbynums')
async def get_msgs_by_nums(
                from_val : int = Query(0, alias='from'),
                firstuid: str = Query(...),
                seconduid: str = Query(...)
            ):
    try:

        if not (firstuid and seconduid):
            raise HTTPException(status_code=400, detail="Both firstuid and seconduid are required")
        
        return await ChatService.get_msg_by_nums(from_val, firstuid, seconduid)
    
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"message":"Interal server Error!"}
        )

@ChatRouter.get('/get-user-unreadedmsg')
async def get_user_unreadedmsg(userid: str = Query(...)):
    try:

        if not (userid):
            raise HTTPException(status_code=400, detail="user id is required")
        return await ChatService.get_user_unreaded_msg(userid)
    
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"message":"Internal server Error!"}
        )


@ChatRouter.get('/mark-msg-asreaded')
async def mark_masg_as_readed(mainuid: str = Query(...), otheruid: str = Query(...)):
    try:
        if not (mainuid and otheruid):
            raise HTTPException(status_code=400, detail="Both mainuid and otheruid are required")
        
        return await ChatService.mark_msg_as_readed(mainuid, otheruid)
    except Exception as e:
        print(e)
        return JSONResponse(
            status_code=500,
            content={"message":"Internal server Error!"}
        )