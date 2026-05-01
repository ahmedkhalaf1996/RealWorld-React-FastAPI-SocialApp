import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from DB.database import init_db
from router.Routers import router
from router.comment import CommentRouter
from grpcservice.chatservice import ChatServer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event
    await init_db()
    chat_server = ChatServer()
    asyncio.create_task(chat_server.start())

    yield  


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins="*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],              
    )


app.include_router(router, prefix="")
app.include_router(CommentRouter, prefix="/posts")

if __name__== "__main__":
    uvicorn.run("main:app", host='0.0.0.0', port=5000, reload=True)

# up