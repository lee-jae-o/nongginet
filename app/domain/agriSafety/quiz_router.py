from fastapi import APIRouter
from fastapi.responses import JSONResponse
import json
import os

router = APIRouter()

QUIZ_FILE = "app/data/generated_quiz.json"

@router.get("/api/quiz")
def get_quiz_data():
    if not os.path.exists(QUIZ_FILE):
        return JSONResponse(content={"message": "퀴즈 데이터가 없습니다."}, status_code=404)

    with open(QUIZ_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
