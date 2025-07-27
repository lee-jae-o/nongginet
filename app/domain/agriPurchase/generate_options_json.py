import os
import requests
import xml.etree.ElementTree as ET
import json
from dotenv import load_dotenv

# ✅ .env에서 API 키 불러오기
load_dotenv()
API_KEY = os.getenv("AGRI_PURCHASE_API_KEY")
BASE_URL = "http://api.nongsaro.go.kr/service/farmMachineDecision/selectAgriPriceInfoLst"

# ✅ 저장 경로 (app/data/agri_purchase_options.json)
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "agri_purchase_options.json")

def fetch_unique_options():
    page_no = 1
    total_count = 0

    unique_knmcNm = set()
    unique_frcnPcYear = set()
    price_list = []

    print("🚜 농기계 구입정보 옵션 수집 시작...")

    while True:
        params = {
            "apiKey": API_KEY,
            "pageNo": page_no,
            "numOfRows": 100
        }

        response = requests.get(BASE_URL, params=params, timeout=10)
        root = ET.fromstring(response.content)

        if total_count == 0:
            total_tag = root.find(".//totalCount")
            if total_tag is not None and total_tag.text.isdigit():
                total_count = int(total_tag.text)
            else:
                break

        items = root.find(".//items")
        if items is None or not list(items):
            break

        for item in items.findall("item"):
            knmcNm = item.findtext("knmcNm", "").strip()
            frcnPcYear = item.findtext("frcnPcYear", "").strip()
            totPc_str = item.findtext("totPc", "").replace(",", "").strip()

            if knmcNm:
                unique_knmcNm.add(knmcNm)
            if frcnPcYear:
                unique_frcnPcYear.add(frcnPcYear)
            if totPc_str.isdigit():
                price_list.append(int(totPc_str))

        print(f"📄 {page_no * 100}/{total_count} 항목 처리 중...")
        page_no += 1
        if page_no * 100 > total_count:
            break

    result = {
        "machine_names": sorted(list(unique_knmcNm)),
        "years": sorted(list(unique_frcnPcYear), reverse=True),
        "min_price": min(price_list) if price_list else 0,
        "max_price": max(price_list) if price_list else 0
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"✅ 옵션 JSON 저장 완료: {os.path.abspath(OUTPUT_PATH)}")

if __name__ == "__main__":
    fetch_unique_options()
