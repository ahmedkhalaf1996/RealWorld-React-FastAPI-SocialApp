from typing import Any, Dict
from bson import ObjectId 
from models.comment_model import Comment
from models.posts_model import Post
from models.users_model import User
from services.notifyService import NotifiationService 
import logging

logger = logging.getLogger(__name__)

class CommentService:
    @staticmethod
    async def CreateComment(data: Dict[Any, str], id: str, userid: str):
        try:
            logger.info(f"Creating comment for post {id} by user {userid}  ")
            new_Comment = Comment(
                postId=id,
                userId=userid,
                value=data['value']
            )


            await new_Comment.save()

            post = await Post.find_one({"_id": ObjectId(id)})
            userCom = await User.find_one({"_id": ObjectId(userid)})

            if post and userCom:
                details = "user " + userCom.name + " Comment On Your Post"
                await NotifiationService.create_notification(
                    deatils=details,
                    mainuid=post.creator,
                    targetid=id,
                    isreded=False,
                    userName=userCom.name,
                    UserAvatar=userCom.imageUrl
                )

                from services.postService import PostService
                return await PostService.GetPostById(id)
        except Exception as e:
            logger.error(f"Error creating comment: {e}")
            return None 
    
    @staticmethod 
    async def GetCommentsByPostId(id: str):
        try:
            pipeline = [
                {"$match": {"postId": id}},
                {"$sort": {"createdAt": -1}},
                {
                    "$lookup": {
                        "from": "users",
                        "let": {"user_id": {"$toObjectId": "$userId"}},
                        "pipeline": [
                            {"$match": {"$expr": {"$eq": ["$_id", "$$user_id"]}}},
                            {"$project": {"name": 1, "imageUrl": 1}}
                        ],
                        "as": "user"
                    }
                },
                {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}}

            ]

            comments = await Comment.aggregate(pipeline).to_list()
            return {"data": comments}
        
        except Exception as e:
            logger.error(f"Error fetching comments: {e}")
            return None 
    
    @staticmethod
    async def DeleteComment(id:str):
        try:
            comment = await Comment.find_one({"_id": ObjectId(id)}).delete()
            if comment:
                return {"message":"comment deleted successfully."}
        except Exception as e:
            logger.error(f"error {e}")
            return None