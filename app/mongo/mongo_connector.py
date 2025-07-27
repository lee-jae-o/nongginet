from pymongo import MongoClient
import os
from dotenv import load_dotenv


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
client = MongoClient(MONGODB_URI)



# ✅ 테스트용
try:
    client.admin.command('ping')
    print("✅ MongoDB 연결 성공")
except Exception as e:
    print("❌ MongoDB 연결 실패:", e)



db = client['chat_database']
chat_collection = db['chat_records']
