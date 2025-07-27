from fastapi import APIRouter, HTTPException
from app.mongo.mongo_connector import chat_collection
from datetime import datetime
from bson import ObjectId


router = APIRouter(prefix="/api/chat", tags=["Chat"])


def save_chat_message(data: dict):
    """
    MongoDB에 채팅 기록 저장
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
 
    document = {
        "session_id": data["session_id"],
        "username": data["username"],
        "messages": data["messages"],
        "first_message": data["messages"][0]["content"] if data["messages"] else "새 프로젝트",
        "timestamp": timestamp
    }
    try:
        result = chat_collection.insert_one(document)
        print(f"✅ 채팅 기록이 MongoDB에 저장되었습니다. ID: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"❌ 채팅 기록 저장 실패: {e}")
        return None


@router.post("/new-session")
async def new_session(session: dict):
    session_id = session.get("session_id")
    username = session.get("username")
    messages = session.get("messages", [])
    
    if not session_id or not username:
        raise HTTPException(status_code=400, detail="세션 ID와 사용자 이름이 필요합니다.")
    
    existing_session = chat_collection.find_one({"session_id": session_id})
    if existing_session:
        return {"message": "Session already exists.", "session_id": session_id}
    
    first_message = messages[0]["content"] if messages else "새 프로젝트"
    
    document = {
        "session_id": session_id,
        "username": username,
        "messages": messages,
        "first_message": first_message,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    chat_collection.insert_one(document)
    return {"message": "New session created.", "session_id": session_id}


@router.get("/sessions/{username}")
async def get_sessions(username: str):
    sessions = list(chat_collection.find({"username": username}, {"_id": 1, "session_id": 1, "first_message": 1}))
    
    if not sessions:
        return {"sessions": []}
    
    for session in sessions:
        session["_id"] = str(session["_id"])
    
    return {"sessions": sessions}


@router.get("/session-messages/{session_id}")
async def get_session_messages(session_id: str):
    session = chat_collection.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="대화 내용을 찾을 수 없습니다.")
    
    session["_id"] = str(session["_id"])
    
    return {"messages": session["messages"]}


@router.post("/save")
async def save_session(data: dict):
    session_id = data.get('session_id')
    messages = data.get('messages')

    if not session_id or not messages:
        raise HTTPException(status_code=400, detail="세션 ID와 메시지 목록이 필요합니다.")

    existing_session = chat_collection.find_one({"session_id": session_id})
    if existing_session:
        print(f"⚠️ 이미 동일한 세션이 존재합니다. 업데이트합니다.")
        
        first_message = messages[0]["content"] if messages and messages[0]["content"] else "새 프로젝트"

        result = chat_collection.update_one(
            {"session_id": session_id},
            {"$set": {"messages": messages, "first_message": first_message}}
        )

        if result.modified_count == 0:
            print(f"⚠️ 세션 업데이트 없음. ID: {session_id}")
        else:
            print(f"✅ 세션이 업데이트되었습니다. ID: {session_id}")
        
        return {"message": "Session updated."}
    else:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        document = {
            "session_id": session_id,
            "username": data["username"],
            "messages": messages,
            "first_message": messages[0]["content"] if messages else "새 프로젝트",
            "timestamp": timestamp
        }
        result = chat_collection.insert_one(document)
        print(f"✅ 새 세션이 MongoDB에 저장되었습니다. ID: {result.inserted_id}")
        return {"message": "Session created."}
    

@router.delete("/delete/{session_id}")
async def delete_session(session_id: str):
    result = chat_collection.delete_many({"session_id": session_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="삭제할 세션이 없습니다.")
    
    print(f"✅ {session_id} 세션이 삭제되었습니다.")
    return {"message": f"{session_id} 세션이 삭제되었습니다."}