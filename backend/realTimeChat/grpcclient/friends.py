from typing import List
import grpc

import sys 
sys.path.append('protos')

from protos.Chat_pb2_grpc import RealTimeChatServiceStub 
from protos.Chat_pb2 import UserID, MessageRequest 

async def get_user_friends(user_id: str) -> List[str]:
        channel = grpc.aio.insecure_channel('localhost:5001')
        stub = RealTimeChatServiceStub(channel)
        user_id_message = UserID(userid=user_id)
        response = await stub.GetUserFollowingFollowers(user_id_message)
        print(f" user friends: {response}")
        return response.userIDsLists[0].userIdsList 

def send_message(msg):
    print(f"Sending message: {msg}")

    channel = grpc.insecure_channel('localhost:5001')
    stub = RealTimeChatServiceStub(channel)
    message = MessageRequest(sender=msg['sender'], receiver=msg['recever'], content=msg['content']) 
    response = stub.SendMessage(message)
    return response.message
