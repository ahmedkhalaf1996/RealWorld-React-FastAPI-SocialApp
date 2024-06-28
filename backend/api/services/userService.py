
from typing import Optional
from bson import ObjectId
from models.users_model import User
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
            # TODO posts

            return {"user":user, "posts":"posts"}
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
    async def GetSugUsers(id:str):
        try:
            AllSugUsers = []
            MainUser = await User.find_one({"_id": ObjectId(id)})

            if MainUser:
                for FoIdes in MainUser.following:
                    fuser = await User.find_one({"_id": ObjectId(FoIdes)})
                    for i in fuser.followers:
                        if not str(i) == str(MainUser.id):
                            lastf = await User.find_one({"_id": ObjectId(i)})
                            AllSugUsers.append(lastf)
                    for uid in fuser.following:
                        if not str(uid) == str(MainUser.id):
                            lastg = await User.find_one({"_id": ObjectId(uid)})
                            AllSugUsers.append(lastg)
            return {"users": AllSugUsers}

        except:
            return None
        
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
