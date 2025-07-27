import os
import json
import requests
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()
API_KEY = os.getenv("NONGSARO_API_KEY")

OUTPUT_DIR = "app/data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

GUIDE_URL = "http://api.nongsaro.go.kr/service/machineSafety/machineSafetyLst"
ACCIDENT_LIST_URL = "http://api.nongsaro.go.kr/service/agriAccident/agriAccidentLst"
ACCIDENT_DETAIL_URL = "http://api.nongsaro.go.kr/service/agriAccident/agriAccidentDtl"


def fetch_api_data(url, params):
    try:
        response = requests.get(url, params=params)
        response.encoding = 'utf-8'
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"⚠️ API 요청 실패: {e}")
        return None


def parse_guide_data(xml_str):
    root = ET.fromstring(xml_str)
    items = []
    for item in root.findall(".//item"):
        items.append({
            "cntntsNo": item.findtext("cntntsNo", ""),
            "cntntsSj": item.findtext("cntntsSj", ""),
            "cn": item.findtext("cn", ""),
            "safeacdntSeNm": item.findtext("safeacdntSeNm", ""),
            "knmcNm": item.findtext("knmcNm", "")
        })
    return items


def parse_accident_list(xml_str):
    root = ET.fromstring(xml_str)
    return root.findall(".//item")


def fetch_accident_detail(cntntsNo):
    params = {
        "apiKey": API_KEY,
        "cntntsNo": cntntsNo
    }
    try:
        response = requests.get(ACCIDENT_DETAIL_URL, params=params)
        response.raise_for_status()
        root = ET.fromstring(response.content)
        return root.findtext(".//cn") or root.findtext(".//atpnCn") or ""
    except Exception as e:
        print(f"⚠️ 상세 API 오류 (cntntsNo={cntntsNo}): {e}")
        return ""


def save_json(data, filename):
    with open(os.path.join(OUTPUT_DIR, filename), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    guide_params = {
        "apiKey": API_KEY,
        "pageNo": 1,
        "numOfRows": 100
    }
    guide_xml = fetch_api_data(GUIDE_URL, guide_params)
    if guide_xml:
        guide_data = parse_guide_data(guide_xml)
        save_json(guide_data, "safety_guide_data.json")
        print(f"✅ 안전지침 {len(guide_data)}건 저장 완료")
    else:
        print("❌ 안전지침 API 실패")


    accident_params = {
        "apiKey": API_KEY,
        "pageNo": 1,
        "numOfRows": 100
    }
    accident_xml = fetch_api_data(ACCIDENT_LIST_URL, accident_params)
    if accident_xml:
        list_items = parse_accident_list(accident_xml)
        accident_data = []
        for item in tqdm(list_items, desc="📦 사고사례 상세 수집"):
            cntntsNo = item.findtext("cntntsNo", "")
            cntntsSj = item.findtext("cntntsSj", "")
            knmcCodeNm = item.findtext("knmcCodeNm", "")
            safeAcdntSeCodeNm = item.findtext("safeAcdntSeCodeNm", "")
            detail = fetch_accident_detail(cntntsNo).strip()

            if detail:
                accident_data.append({
                    "cntntsNo": cntntsNo,
                    "cntntsSj": cntntsSj,
                    "cn": detail,
                    "knmcCodeNm": knmcCodeNm,
                    "safeAcdntSeCodeNm": safeAcdntSeCodeNm
                })

        save_json(accident_data, "accident_case_data.json")
        print(f"✅ 사고사례 {len(accident_data)}건 저장 완료")
    else:
        print("❌ 사고사례 API 실패")


if __name__ == "__main__":
    main()
