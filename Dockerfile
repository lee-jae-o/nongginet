# 1. Python 3.10 slim 버전 기반 이미지
FROM python:3.10-slim


# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. requirements.txt 복사
COPY requirements.txt .

# 4. 필요한 Python 라이브러리 설치
RUN pip install --no-cache-dir -r requirements.txt


COPY frontend/build /app/app/frontend/build


# 5. 전체 프로젝트 복사
COPY . .

# 6. 포트 오픈 (FastAPI 기본 포트 8000)
EXPOSE 8000

# 7. FastAPI 서버 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
