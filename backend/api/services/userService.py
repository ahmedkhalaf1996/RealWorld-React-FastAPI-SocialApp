
from typing import Optional
from bson import ObjectId
from models.users_model import User
from models.posts_model import Post
from passlib.context import CryptContext
from interfaces.userInterfaces import CraeteUser, LoginUser, UpdateUserInterface
from auth.auth_handler import signJWT
from services.notifyService import NotifiationService

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserService:
    @staticmethod
    async def createUser(user: CraeteUser):
        try:
            user_in = User(
                name= user.firstName + " " + user.lastName,
                email=user.email,
                password=password_context.hash(user.password)
            )

            craeteUser = await user_in.save()
            token = signJWT(str(craeteUser.id))
            return {"result": user_in , "token":token['acess_token']}
        except Exception as e:
             print("err", e)

# Login user
    @staticmethod
    async def authenticate(userBody: LoginUser):
        user = await UserService.get_user_by_email(email=userBody.email)
        if not user:
            return None
        if not  password_context.verify(userBody.password, user.password):
            return None 
        # TODO generete token
        token = signJWT(str(user.id))
        return {"result":user, "token":token['acess_token']}



# get user by email
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        user = await User.find_one(User.email == email)
        return user
    
# get user by id 
# TODO :: REturn the posts
    @staticmethod
    async def getUserByid(userid: str):
        try:
            user = await User.find_one({"_id": ObjectId(userid)})
            if not user: return None

            posts_count = await Post.find({"creator": userid}).count()

            return {"user":user, "postsCount":posts_count}
        except:
            return None
        

    # Update User
    @staticmethod
    async def UpdateUser(body: UpdateUserInterface, id: str):
        user = await User.find_one({"_id": ObjectId(id)})
        user.name = body.name
        user.bio = body.bio
        user.imageUrl = body.imageUrl
        await user.save()

        # TODO return user posts
        return {"user":user, "posts":"posts"}
        

    # FollowingUser
    @staticmethod
    async def FollowingUser(id:str, NextUserID: str):
        try:
          user1 = await User.find_one({"_id": ObjectId(id)})
          user2 = await User.find_one({"_id": ObjectId(NextUserID)})
          # check if n user exists in main user followewrs list
          if NextUserID in user1.followers:
              user1.followers.remove(NextUserID)
              user2.following.remove(id)
          else:
              user1.followers.append(NextUserID)
              user2.following.append(id) 
              # TODO :: start caliing notification
              deatils = "user " + user2.name + " Start Following You"
              await NotifiationService.create_notification(
                    deatils=deatils,
                    mainuid=id,
                    targetid=NextUserID,
                    isreded=False,
                    userName=user2.name,
                    UserAvatar=user2.imageUrl
                )


          await user1.save()
          await user2.save()

          return {"updateduser1": user1, "updateduser2": user2}             
        except:
            return None
        

    
    # Get some sug users for our user
    @staticmethod
    async def GetSugUsers(id: str):
        main_user = await User.find_one({"_id": ObjectId(id)})
        if not main_user:
            return {"users": []}
        excluded = set(str(x) for x in main_user.following)
        excluded.add(str(main_user.id))
        suggested = set()
        for follow_id in main_user.following:
            user = await User.find_one({"_id": ObjectId(follow_id)})
            if not user:
                continue
            for follower in user.followers:
                if str(follower) not in excluded:
                    suggested.add(str(follower))

            for following in user.following:
                if str(following) not in excluded:
                    suggested.add(str(following))

        users = await User.find({
            "_id": {
                "$in": [ObjectId(uid) for uid in suggested]
            }
        }).to_list()

        return {"users": users}
        # DeleteUser


    # user delete
    @staticmethod 
    async def DeleteUser(id:str):
        try: 
            user = await  User.find_one({"_id": ObjectId(id)}).delete()
            if user:
                return {"message":"user Delted Successfully."}
        except:
            return None


    @staticmethod 
    async def getUserFriendsgRPc(userid:str):
        try:
            user = await User.find_one({"_id": ObjectId(userid)})
            follwing_ids = user.following
            followers_ids = user.followers

            following_and_followers = list(set(follwing_ids + followers_ids))
            final_list = [str(id) for id in following_and_followers]
            return final_list
        except Exception as e:  
            print("Error in getUserFriendsgRPc:", e)
            return None
# up