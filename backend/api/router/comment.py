from typing import Any, Dict
from fastapi import APIRouter, status, Depends, Request
from fastapi.responses import JSONResponse
from auth.auth_bearer import JWTBearer
from auth.auth_handler import decodeJWT
from services.commentService import CommentService


CommentRouter = APIRouter()

@CommentRouter.post("/{id}/commentPost", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_201_CREATED)
async def comment(request: Request, data: Dict[Any, str], id: str):
    try:
        UserId = decodeJWT(request.headers.get("authorization").split(" ")[1])["user_id"]
        return await CommentService.CreateComment(data, id, UserId)
    except Exception as e:
        return JSONResponse(
            content={"Error": str(e)},
              status_code=status.HTTP_400_BAD_REQUEST
              )
# @CommentRouter.get("/{id}/comments", status_code=status.HTTP_200_OK)
# async def get_comments(id: str):
#     try:
#         return await CommentService.GetCommentsByPostId(id)
#     except Exception as e:
#         return JSONResponse(
#             content={"Error": str(e)},
#               status_code=status.HTTP_400_BAD_REQUEST
#               )
@CommentRouter.delete("/{id}/deleteComment", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def delete_comment(id: str):
    try:
        return await CommentService.DeleteComment(id)
    except Exception as e:
        return JSONResponse(
            content={"Error": str(e)},
              status_code=status.HTTP_400_BAD_REQUEST
              )