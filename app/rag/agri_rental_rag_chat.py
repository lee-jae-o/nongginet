import os
from dotenv import load_dotenv
from fastapi import APIRouter
from pydantic import BaseModel
from langchain.chains import RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.prompts import PromptTemplate
from langchain_openai import OpenAIEmbeddings


load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

# ✅ 개선된 프롬프트 템플릿 (더 적극적인 추론 허용)
prompt_template = """
당신은 대한민국 농림축산식품부의 2025년 농기계임대 사업시행지침을 기반으로 질문에 답변하는 전문 AI 어시스턴트입니다.

[답변 지침]
1. 제공된 문서 내용을 기반으로 정확하고 구체적으로 답변하세요
2. 문서에 직접적인 표현이 없더라도 관련 조항이나 맥락을 토대로 합리적인 추론을 통해 답변하세요
3. 여러 조항이 관련될 경우 종합적으로 판단하여 설명하세요
4. 법령이나 지침의 취지를 고려하여 실무적인 해석을 제공하세요
5. 정말로 문서에서 전혀 확인할 수 없는 내용만 "문서에서 확인할 수 없습니다"라고 하세요
6. 번호나 목록을 사용하여 체계적으로 설명하세요
7. 문서에서 다른 법령을 참조하고 있다면, 해당 법령의 취지나 구조를 간략히 설명하여 답변의 이해를 돕도록 하세요.
8. 문서와 관련 없는 인사말이나 잡담에는 가볍게 반응하고, 굳이 문서를 찾지 말고 자연스럽게 응대하세요.

[중요]
- 문서의 취지와 관련 조항들을 종합적으로 고려하여 실용적인 답변을 제공하세요
- 단순히 글자 그대로만 해석하지 말고, 정책의 목적과 맥락을 고려하세요
- 애매한 경우에도 관련 조항을 근거로 추론하여 도움이 되는 답변을 하세요

문서 내용:
{context}

질문: {question}

답변:
"""

prompt = PromptTemplate(
    input_variables=["context", "question"],
    template=prompt_template
)


embedding = OpenAIEmbeddings(api_key=api_key)
vectorstore = Chroma(
    persist_directory="chroma_data_agri_rental",
    embedding_function=embedding
)


qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(api_key=api_key, temperature=0.1, model="gpt-4o-mini"),  # 약간의 창의성 허용
    chain_type="stuff",
    retriever=vectorstore.as_retriever(
        search_type="similarity",  
        search_kwargs={"k": 12}  
    ),
    chain_type_kwargs={"prompt": prompt}
)


@router.post("/api/rag/agri-rental/query")
async def query_agri_rental_chatbot(request: QueryRequest):
    try:
        result = qa.run(request.query)
        return {"response": result}
    except Exception as e:
        return {"response": f"죄송합니다. 답변 처리 중 오류가 발생했습니다: {str(e)}"}

# ✅ 추가: 검색 성능 테스트용 엔드포인트
@router.post("/api/rag/agri-rental/search-test")
async def test_search(request: QueryRequest):
    """검색된 문서 내용을 확인하는 디버깅용 엔드포인트"""
    try:
        docs = vectorstore.similarity_search(request.query, k=5)
        results = []
        for i, doc in enumerate(docs):
            results.append({
                "chunk_id": i+1,
                "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                "metadata": doc.metadata
            })
        return {"search_results": results}
    except Exception as e:
        return {"error": str(e)}