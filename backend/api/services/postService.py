import math 
from typing import Any , Dict, List, Mapping
from bson import ObjectId, Regex
from models.posts_model import Post
from models.users_model import User
from services.notifyService import NotifiationService
from interfaces.postInterfaces import CommentPostInterface, CreateUpdatePostInterface

import logging

logger = logging.getLogger(__name__)


class PostService:
    # create Post
    @staticmethod
    async def createPost(post:Post):
        try:
            await post.save()
            return post 
        except Exception as e:
            print("post create error",e )
            return None


    # Add Comment To the post
    @staticmethod
    async def CommentPostMethod(data: CommentPostInterface, id:str, userid:str):
        try:
            post = await Post.find_one({"_id": ObjectId(id)})
            post.comments.append(data.value)
            await post.save()

            userCom = await User.find_one({"_id": ObjectId(userid)})
            deatils = "user " + userCom.name + " Comment On Your Post"
            await NotifiationService.create_notification(
                deatils=deatils,
                mainuid=post.creator,
                targetid=id,
                isreded=False,
                userName=userCom.name,
                UserAvatar=userCom.imageUrl
            )

            return {"data":post}
        except:
            return None


    # GetPostById
    @staticmethod
    async def GetPostById(id:str):
        try:
            post = await Post.find_one({"_id": ObjectId(id)}) 
            return {"post": post}

        except Exception as e:
            print("error",e )
            return None


    # GetPostUsersBySearch
    @staticmethod
    async def GetPostUsersBySearch(searchQuery:str):
        try:
            posts = await Post.find_many({"$text": {"$search": searchQuery}}).to_list()
            users = await User.find_many({"$text": {"$search": searchQuery}}).to_list()

            return {"user": users, "posts": posts}
        except:
            return None
    # GetAllPosts Related To the User && wit Pagenation
    @staticmethod
    async def GetAllPosts(pageStr:str, id:str):
        try:
            page = 1
            if pageStr:
                page = int(pageStr)
            
            Limit = 2
            startIndex = (int(page) -1) * Limit

            # ..
            MainUser = await User.find_one({"_id": ObjectId(id)}) 
            MainUser.following.append(str(MainUser.id))

            MainStr = []
            for uid in MainUser.following:
                MainStr.append( {"creator" : uid} )

            total = await Post.find({"$or": MainStr }).count()
            Posts = await Post.find({"$or": MainStr}).sort(-Post.createdAt).limit(Limit).skip(startIndex).to_list()

            return {
                "data": Posts,
                "currentPage": page,
                "numberOfPages": math.ceil(float(total) / float(Limit))
            }
        
        except:
            return None

    # UpdatePost
    @staticmethod 
    async def UpdatePost(id:str, newPost: CreateUpdatePostInterface ):
        try:
            upadtedPost = {
                "title": newPost.title,
                "message": newPost.message,
                "selectedFile": newPost.selectedFile,
            }

            post = await Post.find_one({"_id": ObjectId(id)}) 
            await post.update({"$set": upadtedPost})
            post = await Post.find_one({"_id": ObjectId(id)}) 

            return {"data": post}
        except:
            return None
    # Like Post
    @staticmethod
    async def LikePost(id:str, UserId:str):
        try:
            post = await Post.find_one({"_id": ObjectId(id)})
            if UserId in post.likes:
                post.likes.remove(UserId)
            else: 
                post.likes.append(UserId)
                # TODO Notify the post craetor 
                userCom = await User.find_one({"_id": ObjectId(UserId)})
                deatils = "user " + userCom.name + " Like On Your Post"
                await NotifiationService.create_notification(
                    deatils=deatils,
                    mainuid=post.creator,
                    targetid=id,
                    isreded=False,
                    userName=userCom.name,
                    UserAvatar=userCom.imageUrl
                )
            await post.save()
            return post
        except Exception as e:
            logger.error(f"Error like the post {id}: {e}")
            return None
 
    # Delete Post
    @staticmethod
    async def DeletePost(id:str):
        try:
            post = await Post.find_one({"_id": ObjectId(id)}).delete()
            if post:
                return {"message":"post deleted successfully."}
        except Exception as e:
            logger.error(f"error {e}")
            return None
