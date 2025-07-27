import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PDFPlumberLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma


load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")


pdf_path = "app/data/2025년 농기계임대 사업시행지침.pdf"
persist_directory = "chroma_data_agri_rental"


def save_documents():
    print("✅ PDF 문서 로딩 중...")
    loader = PDFPlumberLoader(pdf_path)
    pages = loader.load()

    print(f"✅ 총 페이지 수: {len(pages)}")
    splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
    documents = splitter.split_documents(pages)

    print(f"✅ 분할된 문서 수: {len(documents)}")
    embedding = OpenAIEmbeddings(api_key=api_key)
    vectorstore = Chroma.from_documents(
        documents=documents,
        embedding=embedding,
        persist_directory=persist_directory
    )
    vectorstore.persist()
    print("🎉 벡터 DB 저장 완료! → chroma_data_agri_rental")


# ✅ 1회 실행용
# if __name__ == "__main__":
#     save_documents()


















# # app/rag/agri_rental.py

# import os
# from dotenv import load_dotenv
# from langchain_community.document_loaders import TextLoader  # ✅ Markdown 로더
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_openai import OpenAIEmbeddings
# from langchain_community.vectorstores import Chroma

# # ✅ 환경 변수 로드
# load_dotenv()
# api_key = os.getenv("OPENAI_API_KEY")

# # ✅ Markdown 파일 및 벡터 저장 경로 설정
# md_path = "app/data/2025_농기계임대_사업시행지침.md"  # ✅ 변경된 경로
# persist_directory = "chroma_data_agri_rental"

# # ✅ 벡터 저장 함수
# def save_documents():
#     print("✅ Markdown 문서 로딩 중...")
#     loader = TextLoader(md_path, encoding="utf-8")  # ✅ TextLoader로 로딩
#     pages = loader.load()

#     print(f"✅ 불러온 문서 수: {len(pages)}")  # 보통 1개로 나옴
#     splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=100)
#     documents = splitter.split_documents(pages)

#     print(f"✅ 분할된 문서 수: {len(documents)}")
#     embedding = OpenAIEmbeddings(api_key=api_key)
#     vectorstore = Chroma.from_documents(
#         documents=documents,
#         embedding=embedding,
#         persist_directory=persist_directory
#     )
#     vectorstore.persist()
#     print("🎉 벡터 DB 저장 완료! → chroma_data_agri_rental")

# # ✅ 실행
# # if __name__ == "__main__":
# #     save_documents()
