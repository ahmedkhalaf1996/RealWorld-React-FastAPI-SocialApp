import json 
from fastapi import Response
from models.notificaion_model import Notification, UserInSchema

class NotifiationService:
    @staticmethod
    async def get_user_notification(userid):
        try:
            filter = {"mainuid": {"$regex": userid, "$options": "i"}}
            notifications = await Notification.find(filter).sort(-Notification.id).to_list()

            return {"notifications":notifications}

        except Exception as e: 
            print('Error getting user Notifiations', e)
            return Response(
                response=json.dumps({"notifications": []}),
                status=500,
                mimetype="application/json"
            )

    @staticmethod
    async def mark_not_as_readed(id):
        try:
            filtter = {"mainuid": id}
            await Notification.find(filtter).update({"$set":{Notification.isreded: True}})

            notifications = await Notification.find(filtter).sort(-Notification.id).to_list()
            return {"notifications":notifications}

        except Exception as e: 
            print('Error getting user Notifiations', e)
            return Response(
                response=json.dumps({"notifications": []}),
                status=500,
                mimetype="application/json"
            )


    @staticmethod
    async def create_notification(deatils:str, mainuid: str, targetid: str, isreded:bool, userName:str, UserAvatar: str):
        try:
            notifcation = Notification(
                deatils=deatils,
                mainuid=mainuid,
                targetid=targetid,
                isreded=isreded,
                user=UserInSchema(
                    name=userName,
                    avatar=UserAvatar
                )
            )

            # TODO Calling gRPC HERE
            await notifcation.save()
            print("notifcation created successfully")
            return {"notification_id": str(notifcation.id)}
        except Exception as e:
            print("Error creating notification", e)
            return {"error": str(e)}