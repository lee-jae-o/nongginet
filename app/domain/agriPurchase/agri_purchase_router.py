import os
import json
from fastapi import APIRouter, Query, HTTPException
from typing import List
from app.domain.agriPurchase.agri_purchase_schema import AgriPurchaseResponse

router = APIRouter(prefix="/api/agri-purchase", tags=["AgriPurchase"])

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "agri_purchase_full.json")
DESCRIPTION_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "machine_info.json")

@router.get("/search", response_model=List[AgriPurchaseResponse])
def search_from_json(
    knmcNm: str = Query(None),
    frcnPcYear: str = Query(None),
    min_price: int = Query(0),
    max_price: int = Query(999999999)
):
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            all_items = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 파일 로딩 실패: {str(e)}")

    filtered = []
    for item in all_items:
        try:
            totPc_int = int(item.get("totPc", "0").replace(",", ""))
        except:
            continue

        if knmcNm and knmcNm not in item.get("knmcNm", ""):
            continue
        if frcnPcYear and frcnPcYear != item.get("frcnPcYear", ""):
            continue
        if totPc_int < min_price or totPc_int > max_price:
            continue

        filtered.append({
            "frcnPcSeqNo": item.get("frcnPcSeqNo"),
            "knmcNm": item.get("knmcNm"),
            "fomNm": item.get("fomNm"),
            "mnfcNm": item.get("mnfcNm"),
            "frcnPcYear": item.get("frcnPcYear"),
            "totPc": item.get("totPc"),
            "gnrlfrmhsSportPc": item.get("gnrlfrmhsSportPc"),
            "copertnHghltExcfmSportPc": item.get("copertnHghltExcfmSportPc"),
            "horsepower": item.get("thtmStndrdNclInfo", "") 
        })

    return filtered


@router.get("/description/{knmcNm}")
def get_machine_description(knmcNm: str):
    try:
        with open(DESCRIPTION_FILE, "r", encoding="utf-8") as f:
            descriptions = json.load(f)
        return descriptions.get(knmcNm, {"description": "설명 정보가 없습니다."})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"설명 파일 로딩 실패: {str(e)}")