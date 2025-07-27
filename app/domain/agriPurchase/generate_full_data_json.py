import os
import requests
import xml.etree.ElementTree as ET
import json
import html
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("AGRI_PURCHASE_API_KEY")
BASE_URL = "http://api.nongsaro.go.kr/service/farmMachineDecision/selectAgriPriceInfoLst"

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "agri_purchase_full.json")

def fetch_all_data():
    page_no = 1
    total_count = 0
    all_items = []

    print("🚜 농기계 전체 데이터 수집 시작...")

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
            record = {child.tag: (html.unescape(child.text.strip()) if child.text else "") for child in item}
            all_items.append(record)

        print(f"📄 {page_no * 100}/{total_count} 항목 처리 중...")
        page_no += 1
        if page_no * 100 > total_count:
            break

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_items, f, ensure_ascii=False, indent=2)

    print(f"✅ 전체 JSON 저장 완료: {os.path.abspath(OUTPUT_PATH)}")

if __name__ == "__main__":
    fetch_all_data()
