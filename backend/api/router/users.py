from typing import Optional
from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import JSONResponse
from auth.auth_bearer import JWTBearer
from auth.auth_handler import decodeJWT
from services.userService import UserService
from interfaces.userInterfaces import CraeteUser, LoginUser, UpdateUserInterface



UserRouter = APIRouter()

# regigester new user
@UserRouter.post('/signup', status_code=status.HTTP_201_CREATED)
async def createUser(user: CraeteUser):
    try:
        return await UserService.createUser(user)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message":"User Already Exist"}
        )

# Login user
@UserRouter.post('/signin', status_code=status.HTTP_200_OK)
async def loginUser(user: LoginUser):
    user = await UserService.authenticate(user)
    if not user:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message":"user with provided credentials is not found."}
        )
    return user


# get user info and posts 
@UserRouter.get("/getUser/{id}")
async def GetUser(id:str):
    data = await UserService.getUserByid(id)
    if not data:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message":"user not found."}
        )
    return data


@UserRouter.patch("/Update/{id}", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def Update(request: Request,userBody: UpdateUserInterface, id:str):
    try:
        uidFromTok = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]
        if not uidFromTok == id:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error":"you are not authorized to update this profile"}
           )
        return await UserService.UpdateUser(userBody, id)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"can't update user data"}
        )

# Following User
@UserRouter.patch("/{id}/following", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def startfollwing(request: Request, id:str):
    NextUserID = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]
    try:
        return await UserService.FollowingUser(id, NextUserID)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"can't follow the user"}
        )


# Get Sugested users
@UserRouter.get("/getSug",  status_code=status.HTTP_200_OK)
async def getSug(id:Optional[str] = None):
    try:
        if id:
            return await UserService.GetSugUsers(id)
    except:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message":"no suggestd users"}
        )     


@UserRouter.delete("/delete/{id}", dependencies=[Depends(JWTBearer())], status_code=status.HTTP_200_OK)
async def DeleteUser(request: Request, id:str):
    try:
        uidFromTok = decodeJWT(request.headers["authorization"].split(" ")[1])["user_id"]
        if not uidFromTok == id:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error":"you are not authorized to delete this profile"}
           )
        return await UserService.DeleteUser(id)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error":"can't delete user"}
        )

