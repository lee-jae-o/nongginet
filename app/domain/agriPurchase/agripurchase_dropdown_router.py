from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import os
import json

router = APIRouter()

@router.get("/api/agri-purchase/options")
async def get_dropdown_options():
    try:
        file_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "agri_purchase_options.json")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        return JSONResponse(content=data)

    except Exception as e:
        print(f"🔥 JSON 로딩 오류: {str(e)}")
        raise HTTPException(status_code=500, detail="옵션 불러오기 실패")
