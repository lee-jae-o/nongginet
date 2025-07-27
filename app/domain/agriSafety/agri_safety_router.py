import requests
import xml.etree.ElementTree as ET
from fastapi import APIRouter
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
API_KEY = os.getenv("NONGSARO_API_KEY")

@router.get("/api/agri-safety/safety-guide")
def get_safety_guide_list(page: int = 1, rows: int = 100):  
    url = "http://api.nongsaro.go.kr/service/machineSafety/machineSafetyLst"
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
