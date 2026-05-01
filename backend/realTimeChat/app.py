
from fastapi import FastAPI , WebSocket, WebSocketDisconnect
from pydantic import BaseModel

import logging 
from grpcclient import friends 


app = FastAPI()

class Message(BaseModel):
    sender: str
    recever: str
    content: str

class ConnectionManager:
    def __init__(self):
        self.connections: dict = {}

    async def add_connection(self, user_id: str, websocket: WebSocket):
        await websocket.accept()

        if user_id in self.connections:
            try: 
                await self.connections[user_id].close()
            
            except Exception:
                pass
        
        self.connections[user_id] = websocket
        logging.info(f"User {user_id} connected. Online users: {list(self.connections.keys())}")

        # Notify friends about the new connection 
        my_friends = set( await friends.get_user_friends(user_id) )

        my_online_friends = [fid for fid in my_friends if fid in self.connections]

        if my_online_friends: 
            try: 
                await websocket.send_json({"onlineFriends": my_online_friends})
            except Exception as e:
                logging.error(f"Error notifying friends: {e}")

        # tell each online mutal frinend that this user is now online 
        for  friend_id in my_online_friends: 
            friend_ws = self.connections.get(friend_id)
            if not friend_ws:
                continue
            friend_friends = set( await friends.get_user_friends(friend_id) )
            friend_online = [fid for fid in friend_friends if fid in self.connections]
            try: 
               await friend_ws.send_json({"onlineFriends": friend_online})
            except Exception as e:
                logging.error(f"Error notifying friend {friend_id}: {e}")

    # remove connection 
    async def remove_connection(self, user_id: str):
        if user_id not in self.connections:
            logging.warning(f"User {user_id} not in connections on removal.")
            return
        del self.connections[user_id]
        logging.info(f"User {user_id} disconnected ")
        my_friends = set(await friends.get_user_friends(user_id))
        for friend_id in my_friends:
            friend_ws = self.connections.get(friend_id)
            if not friend_ws:
                continue
            friend_friends = set(await friends.get_user_friends(friend_id))
            friend_online = [fid for fid in friend_friends if fid in self.connections]
            try:
                await friend_ws.send_json({"onlineFriends": friend_online})
            except Exception as e:
                logging.error(f"Error notifiying {friend_id} that {user_id} went offline:{e}")
    # send to receiver 
    async def send_to_receiver(self, msg: Message):
        recever = msg.recever 
        recever_ws = self.connections.get(recever)

        try: 
            friends.send_message(msg.model_dump())
        except Exception as e:
            logging.error(f"Error saving message to db via gRPC: {e}")
    

        if recever_ws:
            try:
                await recever_ws.send_json(msg.model_dump())
            except Exception as e:
                logging.error(f"Error sending realtime message to {recever}: {e}")

manager = ConnectionManager()

@app.websocket("/ws/{id}")
async def websocket_endpoint(websocket: WebSocket, id: str):
    await manager.add_connection(id, websocket)
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == 'requestOnline':
                my_friends = set(await friends.get_user_friends(id))
                my_friend_online = [fid for fid in my_friends if fid in manager.connections]
                try:
                    await websocket.send_json({"onlineFriends": my_friend_online})
                except Exception as e:
                    logging.error(f"Error re-sending online list to {id}: {e}")
                continue
            msg = Message(**data)
            await manager.send_to_receiver(msg)
    except WebSocketDisconnect:
        logging.info(f"WebSocket disconnected for user {id}")
    except Exception as e:
        logging.error(f"WebSocket Error for user {id}: {e}")
    finally:
        await manager.remove_connection(id)
    
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
