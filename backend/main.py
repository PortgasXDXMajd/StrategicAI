import os
import uvloop
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from app.repositories.database import Mongo
import app.routers.auth_router as auth_router
import app.routers.task_router as task_router
import app.routers.tree_router as tree_router
import app.routers.node_router as node_router
import app.routers.eval_router as eval_router
import app.routers.file_router as file_router
from fastapi.middleware.cors import CORSMiddleware
import app.routers.company_router as company_router
from fastapi.responses import HTMLResponse, RedirectResponse
import app.routers.notification_socket as notification_socket
import app.routers.tree_analysis_router as tree_analysis_router
import app.routers.tree_decision_router as tree_decision_router
from app.middleware.llm_config_middleware import LLMConfigMiddleware

asyncio.set_event_loop_policy(uvloop.EventLoopPolicy()) 

@asynccontextmanager
async def lifespan(app: FastAPI):
    await Mongo.connect_db()
    yield
    if Mongo.client:
        Mongo.client.close()

load_dotenv()

ENV = os.getenv("ENV", "dev")

app = FastAPI(
    title="StrategicAI",
    lifespan=lifespan,
    docs_url=None if ENV == "prod" else "/docs",
    redoc_url=None if ENV == "prod" else "/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(LLMConfigMiddleware)

@app.middleware("http")
async def enforce_https_in_production(request: Request, call_next):
    response = await call_next(request)
    if ENV == "prod" and isinstance(response, RedirectResponse):
        location = response.headers.get("location", "")
        if location.startswith("http://"):
            response.headers["location"] = location.replace("http://", "https://")
    return response

app.include_router(auth_router.router, tags=["Auth Controller"])
app.include_router(company_router.router, tags=["Company Controller"])
app.include_router(task_router.router, tags=["Task Controller"])
app.include_router(tree_router.router, tags=["Tree Controller"])
app.include_router(tree_analysis_router.router, tags=["Tree Analysis Controller"])
app.include_router(tree_decision_router.router, tags=["Tree Decision Controller"])
app.include_router(node_router.router, tags=["Node Controller"])
app.include_router(notification_socket.router, tags=["Update Manager"])
app.include_router(file_router.router, tags=["File Router"])
app.include_router(eval_router.router, tags=["Eval Router"])

@app.get("/")
def GetHomePage():
    return HTMLResponse("<h1>StrategicAI API</h1>")
