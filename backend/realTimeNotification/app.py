import sys
sys.path.append('protos')

import asyncio
from concurrent import futures 
import grpc 
import google.protobuf.empty_pb2 as empty_pb2 

from protos import Notification_pb2_grpc 
from fastapi import FastAPI, WebSocket 
from typing import Dict 

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        not_server = NotificationService() 
        asyncio.create_task(not_server.start())
    except Exception as e:
        print(f"Error starting gRPC server: {e}")
    yield 

app = FastAPI(lifespan=lifespan)

# grpc server 
class NotificationService(Notification_pb2_grpc.NotificationGrpcServiceServicer):
    async def start(self) -> None:
        thread_pool = futures.ThreadPoolExecutor(max_workers=10)
        server = grpc.aio.server(thread_pool)
        Notification_pb2_grpc.add_NotificationGrpcServiceServicer_to_server(self, server)
        server.add_insecure_port(f'[::]:{8090}')
        await server.start()
        print("gRPC runing on 8090")
        await server.wait_for_termination()
    
    async def SendGrpcNotification(self, request, context):
       try:
            user_id = request.mainuid 
            if user_id in ws_connections:
                websocket = ws_connections[user_id]

                created_at_str = request.createdAt.ToJsonString()

                data = {
                    "_id": request._id,
                    "deatils": request.deatils,
                    "mainuid": request.mainuid,
                    "targetid": request.targetid,
                    "isreded": request.isreded,
                    "createdAt": created_at_str,
                    "user": {
                        "name": request.user.name,
                        "avatar": request.user.avatar
                    }

                }

                # send ws message 
                await websocket.send_json(data)
                print(f"sent WebSocket message to user {user_id}")
            else:
                print(f"User {user_id} not connected")
            return empty_pb2.Empty()

       except Exception as e:
           print(f"Error processing gRPC Notification: {e}")

# websocekt connections stored in a dictionary
ws_connections: Dict[str, WebSocket] = {}

# websocket endpoint 
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    print(f"User {user_id} connected")

    ws_connections[user_id] = websocket

    try: 
      while True:
          data = await websocket.receive_text()
          print(f"Received data from user {user_id}: {data}")

          await websocket.send_text(data)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        del ws_connections[user_id]
        print(f"User {user_id} disconected")


# Run FastAPI Server 
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8088)