from pydantic import BaseModel
from typing import Optional

class AgriPurchaseRequest(BaseModel):
    mnfcNm: Optional[str] = None
    knmcNm: Optional[str] = None
    frcnPcYear: Optional[str] = None
    pageNo: Optional[int] = 1
    numOfRows: Optional[int] = 10

class AgriPurchaseResponse(BaseModel):
    frcnPcSeqNo: Optional[str] = None
    knmcNm: Optional[str] = None         # 기종명
    fomNm: Optional[str] = None          # 형식명
    mnfcNm: Optional[str] = None         # 제조사명
    frcnPcYear: Optional[str] = None     # 연도
    totPc: Optional[str] = None          # 총 가격
    gnrlfrmhsSportPc: Optional[str] = None   # 일반농가 지원가
    copertnHghltExcfmSportPc: Optional[str] = None  # 전업농 지원가
    horsepower: Optional[str] = None     