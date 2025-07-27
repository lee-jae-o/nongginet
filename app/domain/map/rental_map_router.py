import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/map", tags=["지도"])

@router.get("/rental-locations")
async def get_rental_locations():
    with open("app/data/전국농기계임대정보표준데이터.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    markers = []
    for item in data.get("records", []):
        lat = item.get("위도", "")
        lng = item.get("경도", "")
        
        lat_value = float(lat) if lat and lat.strip() else None
        lng_value = float(lng) if lng and lng.strip() else None
        
        markers.append({
            "name": item.get("사업소명", ""),
            "lat": lat_value,
            "lng": lng_value,
            "address": item.get("소재지도로명주소", ""),
            "phone": item.get("사업소전화번호", ""),
            "tractor": item.get("트랙터및작업기보유대수", "0"),
            "cultivator": item.get("경운기및작업기보유대수", "0"),
            "manager": item.get("관리기및작업기보유대수", "0"),
            "rootcrop": item.get("땅속작물수확기보유대수", "0"),
            "thresher": item.get("탈곡기및정선작업기보유대수", "0"),
            "seeder": item.get("자주형파종기보유대수", "0"),
            "riceTransplanter": item.get("이앙작업기보유대수", "0"),
            "riceHarvester": item.get("벼수확및운반작업기보유대수", "0"),
            "other": item.get("기타임대농기계보유정보", ""),
        })

    return JSONResponse(content=markers)