import sys 
sys.path.append('protos')
import grpc

from protos.Chat_pb2_grpc import add_RealTimeChatServiceServicer_to_server 
from protos.Chat_pb2 import MessageResponse, UsersIDsListResponse, UserIDsList 
from services.userService import UserService
from services.chatService import ChatService

class ChatServer:
    def __init__(self):
        self.server = None

    async def start(self) -> None:

        from concurrent import futures
        thread_pool = futures.ThreadPoolExecutor(max_workers=10)

        server = grpc.aio.server(thread_pool)
        add_RealTimeChatServiceServicer_to_server(self, server)
        server.add_insecure_port(f'[::]:{5001}')

        await server.start()
        print("Chat gRPC server started on port 5001")
        await server.wait_for_termination()

    async def stop(self):
        if self.server:
            print("Stopping gRPC server...")
            await self.server.stop(0)  

    async def SendMessage(self, request, context):
        content = request.content
        sender = request.sender 
        recever = request.receiver


        print(f"Received message from {sender} to {recever}: {content}")
        await ChatService.send_message_grpc(sender, recever, content)
        return MessageResponse(message="Message sent successfully")


    async def GetUserFollowingFollowers(self, request, context):
        try:
            user_id = request.userid
            userlist = await UserService.getUserFriendsgRPc(user_id) 
            return UsersIDsListResponse(userIDsLists=[UserIDsList(userIdsList=userlist)])
        except Exception as e:
            print("Error in GetUserFollowingFollowers:", e)
            context.set_code(grpc.StatusCode.NOT_FOUND)
            return UsersIDsListResponse(userIDsLists=[])
      