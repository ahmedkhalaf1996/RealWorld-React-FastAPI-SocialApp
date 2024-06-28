from typing import Any, Dict, Optional
from bson import ObjectId
from fastapi import APIRouter, status, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi import HTTPException
from interfaces.postInterfaces import CommentPostInterface, CreateUpdatePostInterface

from auth.auth_bearer import JWTBearer
from auth.auth_handler import decodeJWT
from models.posts_model import Post 
from services.postService import PostService

PostRouter = APIRouter()

# create post

@PostRouter.post("", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_201_CREATED)
async def createPost(request: Request, data:CreateUpdatePostInterface):
    try: 
        UserId = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]
        post = Post(
            message=data.message,
            selectedFile=data.selectedFile,
            title=data.title,
            creator=UserId
        )
        return await PostService.createPost(post)
    except Exception as e:
        print("ex", e)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"can't create post"}
        )



@PostRouter.post("/{id}/commentPost", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_201_CREATED)
async def comment(request: Request, data:CommentPostInterface, id:str):
    try: 
        UserId = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]

        return await PostService.CommentPostMethod(data,id, UserId)
    except Exception as e:
        print("ex", e)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"Unable to Add your Comment !."}
        )


# get users & posts by seardch
@PostRouter.get("/search")
async def getBySearch(*, searchQuery:Optional[str] = None):
    try:
        return await PostService.GetPostUsersBySearch(searchQuery)

    except:
      return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"No User Or Post Result."}
        )


# get post byid 
@PostRouter.get("/{id}")
async def getPost(id:str):
    post = await PostService.GetPostById(id)
    if not post :
       return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message":"post not found."}
        )       
    return post

# get many post by pagenation & related to the user
@PostRouter.get("", status_code=status.HTTP_200_OK)
async def getPosts(*, page:Optional[str]= None, id:Optional[str ] = None):
    try:
        return await PostService.GetAllPosts(page, id)
    except:
     return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message":"No Posts."}
        )  

# update post 
@PostRouter.patch("/{id}", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def Update(request: Request,id:str, newPost: CreateUpdatePostInterface):
    try:
        # check if this is the creator of the post
        UserId = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]

        post = await Post.find_one({"_id": ObjectId(id)}) 
        if not post :
             return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"message":"post not found."})
          
        if post.creator != UserId :
         return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"you are not authoriezd to upate this post."}
           )

        # sucess     
        return await PostService.UpdatePost(id, newPost)
   
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"can't update post."}
        )


# like on post 
@PostRouter.patch("/{id}/likePost", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def Like(request: Request,id:str):
    try:
        UserId = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]
        update_post = await PostService.LikePost(id, UserId)
        if update_post:
            return update_post
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post Not found")
    except Exception as e:
        print("error", e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="can't Like the Post")

# delete 
@PostRouter.delete("/{id}", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def Delete(request : Request, id:str):
    try: 

        # check if this is the creator of the post
        UserId = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]

        post = await Post.find_one({"_id": ObjectId(id)}) 
        if not post :
             return JSONResponse(
                    status_code=status.HTTP_404_NOT_FOUND,
                    content={"message":"post not found."})
          
        if post.creator != UserId :
         return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"you are not authoriezd to delete this post."}
           )

        # sucess 
        return await PostService.DeletePost(id)
    except:
      return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"can't delete post."}
        )



