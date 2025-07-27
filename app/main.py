from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import RedirectResponse

# LangChain 관련 추가 임포트
from typing import List, Dict, Any
from langchain.schema.messages import HumanMessage, AIMessage

# DB 관련 임포트 (기존 유지)
from app.database import engine, Base
from app.domain.user.user_router import router as user_router
from app.domain.chat.chat_router import router as chat_router, save_chat_message
from app.domain.board.board_router import router as board_router
from app.domain.comment.comment_router import router as comment_router
from app.domain.map.rental_map_router import router as rental_router 
from app.domain.favorite.favorite_model import Favorite
from app.domain.favorite2.favorite2_model import Favorite2


from app.domain.agriPurchase.agri_purchase_router import router as agri_purchase_router
from app.domain.agriPurchase.agripurchase_dropdown_router import router as dropdown_router
from app.domain.agriSafety.agri_safety_router import router as agri_safety_router
from app.domain.agriSafety.agri_accident_router import router as agri_accident_router
from app.domain.agriSafety.quiz_router import router as quiz_router
from app.domain.favorite.favorite_router import router as favorite_router
from app.domain.favorite2.favorite2_router import router as favorite2_router
from app.rag.agri_rental_rag_chat import router as agri_rental_rag_chat
from app.domain.term import term_router


import os
import time

app = FastAPI()

session_chat_histories: Dict[str, List[Dict[str, str]]] = {}


class IndexRedirectMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        if request.url.path == "/index.html":
            return RedirectResponse("/")
        return await call_next(request)

app.add_middleware(IndexRedirectMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")


# ✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅ 라우터 등록 까먹지마라라
app.include_router(user_router)
app.include_router(chat_router)
app.include_router(board_router)
app.include_router(comment_router)
app.include_router(rental_router) 
app.include_router(agri_purchase_router)
app.include_router(dropdown_router)
app.include_router(agri_safety_router)
app.include_router(agri_accident_router)
app.include_router(quiz_router)
app.include_router(favorite_router)
app.include_router(favorite2_router)
app.include_router(agri_rental_rag_chat)
app.include_router(term_router.router)


# HTML 렌더링 (React index.html) - 맨 마지막에 위치해야 함 (?????)
@app.get("/{full_path:path}")
def serve_react_app(full_path: str):
    file_path = os.path.join(frontend_path, "index.html")
    return FileResponse(file_path)