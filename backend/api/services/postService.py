import math 
from typing import Any , Dict, List, Mapping, Optional
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




    # GetPostById
    @staticmethod
    async def GetPostById(id:str):
        try:

            pipeline = [
                {"$match": {"_id": ObjectId(id)}},
                {
                    "$lookup": {
                        "from": "Comment",
                        "let": {"post_id": {"$toString": "$_id"}},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": ["$postId", "$$post_id"]}}},
                            {"$sort": {"createdAt": -1}},
                            {
                               "$lookup": {
                                    "from": "User",
                                    "let": {"user_id": {"$convert": {"input": "$userId", "to": "objectId", "onError": None, "onNull": None}}},
                                    "pipeline": [
                                        {"$match": {"$expr": {"$eq": ["$_id", "$$user_id"]}}},
                                        {"$project": {"name": 1, "imageUrl": 1}}
                                    ],
                                    "as": "user"
                              }
                            },
                            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}}
                        ],
                        "as": "comments"
                    }
                }
            ]

            motor_coll = Post.get_settings().pymongo_db[Post.get_collection_name()]
            post_list = await motor_coll.aggregate(pipeline).to_list(length=None)
            if not post_list:
                return None 
        
            post_data = post_list[0]
            post_data['_id'] = str(post_data['_id'])
            if 'creator' in post_data:
                post_data['creator'] = str(post_data['creator'])
            if 'likes' in post_data:
                post_data['likes'] = [str(l) for l in post_data['likes']]
            if 'user_info' in post_data and post_data['user_info']:
                post_data['name'] = post_data['user_info'].get('name')
                post_data['CreatorImg'] = post_data['user_info'].get('imageUrl')
                if '_id' in post_data['user_info']:
                    post_data['user_info']['_id'] = str(post_data['user_info']['_id'])
            if 'comments' in post_data:
                for c in post_data['comments']:
                    if '_id' in c: c['_id'] = str(c['_id'])
                    if 'postId' in c: c['postId'] = str(c['postId'])
                    if 'userId' in c: c['userId'] = str(c['userId'])
                    if 'user' in c and c['user']:
                        if '_id' in c['user']: c['user']['_id'] = str(c['user']['_id']) 
            return {"post": post_data}          

        except Exception as e:
            print("error",e )
            return None


    # GetPostUsersBySearch
    @staticmethod
    async def GetPostUsersBySearch(searchQuery:str):
        try:
            if not searchQuery:
                return {"data": {"user": [], "posts": []}}
        

            posts = await Post.find({"$or": [
                {"title": {"$regex": searchQuery, "$options": "i"}},
                {"message": {"$regex": searchQuery, "$options": "i"}}
            ]}).to_list()



            users = await User.find({"$or": [
                {"name": {"$regex": searchQuery, "$options": "i"}},
                {"email": {"$regex": searchQuery, "$options": "i"}}
            ]}).to_list()

            return {"data": {"user": users, "posts": posts}}
        except Exception as e:
            logger.error(f"Error in search: {e}")
            return None
    # GetAllPosts Related To the User && wit Pagenation
    @staticmethod
    async def GetAllPosts(pageStr:Optional[str], id:Optional[str], profileId: Optional[str] = None):
        try:
            page = int(pageStr) if pageStr and pageStr.isdigit() else 1 
            
            limit = 6 
            skip = (page - 1) * limit 

            match_query = {}
            if profileId:
                match_query = {"creator": profileId}
            elif id:
                main_user = await User.find_one({"_id": ObjectId(id)}) 
                if main_user:
                    following_ids = main_user.following + [str(main_user.id)]
                    match_query = {"creator": {"$in": following_ids}}
            total = await Post.find(match_query).count()

            # pipeline 
            pipeline = [
                {"$match": match_query},
                {"$sort": {"createdAt": -1}},
                {"$skip": skip},
                {"$limit": limit},
                {
                    "$lookup": {
                        "from": "User",
                        "let": {"creator_id": {"$convert": {"input": "$creator", "to": "objectId", "onError": None, "onNull": None}}},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": ["$_id", "$$creator_id"]}}},
                            {"$project": {"name": 1, "imageUrl": 1}}
                        ],
                        "as": "user_info"
                    }
                },
                {"$unwind": {"path": "$user_info", "preserveNullAndEmptyArrays": True}},
                {
                    "$lookup": {
                        "from": "Comment",
                        "let": {"post_id": {"$toString": "$_id"}},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": ["$postId", "$$post_id"]}}},
                            {"$sort": {"createdAt": -1}},
                            {
                               "$lookup": {
                                    "from": "User",
                                    "let": {"u_id": {"$convert": {"input": "$userId", "to": "objectId", "onError": None, "onNull": None}}},
                                    "pipeline": [
                                        {"$match": {"$expr": {"$eq": ["$_id", "$$u_id"]}}},
                                        {"$project": {"name": 1, "imageUrl": 1}}
                                    ],
                                    "as": "user"
                              }
                            },
                            {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}}
                        ],
                        "as": "comments"
                    }
                }
            ]


            motor_coll = Post.get_settings().pymongo_db[Post.get_collection_name()]
            posts = await motor_coll.aggregate(pipeline).to_list(length=None)
     
            for p in posts:
                p['_id'] = str(p['_id'])
                if 'creator' in p:
                    p['creator'] = str(p['creator'])
                if 'likes' in p:
                    p['likes'] = [str(l) for l in p.get('likes', [])]
                
                # Map creator info
                if 'user_info' in p and p['user_info']:
                    p['name'] = p['user_info'].get('name')
                    p['CreatorImg'] = p['user_info'].get('imageUrl')
                    p.pop('user_info', None) # Remove raw dict to prevent ObjectId leakage
                
                # Map comments info
                if 'comments' in p:
                    for c in p['comments']:
                        if '_id' in c: c['_id'] = str(c['_id'])
                        if 'postId' in c: c['postId'] = str(c['postId'])
                        if 'userId' in c: c['userId'] = str(c['userId'])
                        if 'user' in c and c['user']:
                            if '_id' in c['user']: c['user']['_id'] = str(c['user']['_id'])

            return {
                "data": posts,
                "currentPage": page,
                "numberOfPages": math.ceil(float(total) / float(limit))
            }     

        except Exception as e:
            logger.error(f"Error in GetAllPosts", {e})
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



# up