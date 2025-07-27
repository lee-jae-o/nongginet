import requests
import xml.etree.ElementTree as ET
from fastapi import APIRouter
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
API_KEY = os.getenv("NONGSARO_API_KEY")

@router.get("/api/agri-accident/list")
def get_agri_accident_list(page: int = 1, rows: int = 100):
    url = "http://api.nongsaro.go.kr/service/agriAccident/agriAccidentLst"
    params = {
        "apiKey": API_KEY,
        "pageNo": page,
        "numOfRows": rows,
    }
    response = requests.get(url, params=params)

    try:
        root = ET.fromstring(response.text)
        items = []
        for item_elem in root.findall(".//item"):
            item = {
                child.tag: child.text.strip() if child.text else ""
                for child in item_elem
            }
            items.append(item)
        return {"items": items}
    except Exception as e:
        return {"error": str(e), "raw": response.text}

# 사고사례 상세
@router.get("/api/agri-accident/detail/{cntntsNo}")
def get_agri_accident_detail(cntntsNo: str):
    url = "http://api.nongsaro.go.kr/service/agriAccident/agriAccidentDtl"
    params = {
        "apiKey": API_KEY,
        "cntntsNo": cntntsNo,
    }
    response = requests.get(url, params=params)

    try:
        root = ET.fromstring(response.text)
        item_elem = root.find(".//item")
        if item_elem is None:
            return {"error": "No data found", "raw": response.text}

        item = {
            child.tag: child.text.strip() if child.text else ""
            for child in item_elem
        }
        return {"item": item}
    except Exception as e:
        return {"error": str(e), "raw": response.text}
