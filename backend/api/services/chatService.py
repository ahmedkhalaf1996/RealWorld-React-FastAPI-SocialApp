import json 
from bson import ObjectId 
from beanie import Document
from fastapi import Response
from fastapi.responses import JSONResponse
from models.message_model import Message
from models.unReadedmsg_model import UnReadedMsg
from interfaces.messageInterfaces import MessageRequest

class ChatService:
    # send message
    @staticmethod
    async def send_message(msg:MessageRequest):
        try:
            msg_in = Message(
                content=msg.content,
                sender=msg.sender,
                recever=msg.recever,
            )

            await msg_in.save()
            new_msg = await Message.find_one({"_id": msg_in.id})
            

            # 
            await ChatService.update_unread_messages(msg.sender, msg.recever)

            return {"msg": new_msg}
        except Exception as e:
            print(e)

    # update unreaded messages
    @staticmethod
    async def update_unread_messages(sender, recever):
        try:
            existing_record = await UnReadedMsg.find_one({"mainUserid": recever, "otherUserid": sender})

            if existing_record:
                await existing_record.update({"$inc": {"numOfUnreadedMessages":1}, "$set": {"isReaded": False}})
            else:
                new_unread_msg = UnReadedMsg(
                    mainUserid=recever,
                    otherUserid=sender,
                    numOfUnreadedMessages=1,
                    isReaded=False
                )
                await new_unread_msg.insert()
            print("Update or created Unreadedmsg recored")
        except Exception as e:
            print("Error updatting or crateing UnreadedMsg document:", e)

    # get msg by numbers
    @staticmethod
    async def get_msg_by_nums(from_val, firstuid, seconduid):
        try: 
            sender_filtter = {"sender": str(firstuid), "recever": str(seconduid)}
            recever_filtter = {"sender": str(seconduid), "recever": str(firstuid)}

            messages = await Message.find({"$or": [sender_filtter, recever_filtter]}).sort(-Message.id).limit(8).skip(int(from_val * 8)).to_list()

            messages.reverse()

            return {"msgs": messages}
        except Exception as e:
            print("Error on Chatrerservice", e)
            return {"msgs": None}
    # get user unreaded msg
    @staticmethod
    async def get_user_unreaded_msg(userid):
        try:
            urms = await UnReadedMsg.find({"mainUserid": userid, "isReaded":False}).to_list()

            total_unreadedMessagesCount = sum(msg.numOfUnreadedMessages for msg in urms)

            return {"messages": [msg.dict() for msg in urms], "total": total_unreadedMessagesCount}
        except Exception as e :
            print(e)
            return Response(
                response=json.dumps({"error": "internal server Error"}),
                status=500,
                mimetype="aplication/json"
            )

    # mark msg as readed
    @staticmethod
    async def mark_msg_as_readed(mainuid, otheruid):
        try:
            filter = {"mainUserid": mainuid, "otherUserid": otheruid}
            update = {"$set": {"isReaded": True, "numOfUnreadedMessages": 0}}

            result = await UnReadedMsg.find_one(filter)

            await result.update(update)

            if result:
                return {"isMarked": True}
            else :
                return {"isMarked": False}
        except Exception as e:
            print("Error on chat service",  e)
            return {"error": str(e)}











