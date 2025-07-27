import os
import requests
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import xml.etree.ElementTree as ET

load_dotenv()

router = APIRouter()
API_KEY = os.getenv("NONGSARO_TERMS_API_KEY")


@router.get("/api/terms/search")
async def search_terms(word: str = Query(..., description="검색어"), page: int = 1, rows: int = 10):
    url = "http://api.nongsaro.go.kr/service/farmDic/searchFrontMatch"
    params = {
        "apiKey": API_KEY,
        "word": word,
        "pageNo": page,
        "numOfRows": rows
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return JSONResponse(status_code=500, content={"error": "API 요청 실패"})

    root = ET.fromstring(response.content)
    items = root.findall(".//item")

    result = []
    for item in items:
        result.append({
            "wordNm": item.findtext("wordNm"),
            "langNm": item.findtext("langNm"),
            "wordNo": item.findtext("wordNo"),
            "wordType": item.findtext("wordType"),
            "faoCode": item.findtext("faoCode")
        })

    return {"results": result}


@router.get("/api/terms/detail")
async def get_term_detail(wordNo: str = Query(...)):
    url = "http://api.nongsaro.go.kr/service/farmDic/detailWord"
    params = {
        "apiKey": API_KEY,
        "wordNo": wordNo
    }

    try:
        response = requests.get(url, params=params)
        print("상세 응답 확인:", response.content.decode("utf-8")) 
        if response.status_code != 200:
            return JSONResponse(status_code=500, content={"error": "상세 조회 실패"})

        root = ET.fromstring(response.content)
        item = root.find(".//item")
        if item is None:
            return {"detail": None}

        return {
            "detail": {
                "wordNm": item.findtext("wordNm"),
                "wordNo": item.findtext("wordNo"),
                "langNm": item.findtext("langNm"),
                "wordDc": item.findtext("wordDc"),
                "faoCode": item.findtext("faoCode"),
                "wordType": item.findtext("wordType")
            }
        }

    except Exception as e:
        print("상세조회 오류:", e)
        return JSONResponse(status_code=500, content={"error": "서버 오류"})
