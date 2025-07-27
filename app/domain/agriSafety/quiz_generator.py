import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# .env에서 API 키 로드
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 데이터 파일 경로
GUIDE_FILE = "app/data/safety_guide_data.json"
ACCIDENT_FILE = "app/data/accident_case_data.json"
OUTPUT_FILE = "app/data/generated_quiz.json"


def load_data(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_quiz_from_content(content, max_quiz=1):
    prompt = f"""
다음 문장을 기반으로 객관식 퀴즈 {max_quiz}개를 만들어줘.

문장:
\"\"\"{content}\"\"\"

각 퀴즈는 아래 JSON 형식으로 만들어줘:

{{
  "question": "...",
  "choices": ["...", "...", "...", "..."],
  "answer": "정답 문자열",
  "explanation": "해설"
}}

결과는 반드시 JSON 배열로 반환해줘.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        content = response.choices[0].message.content.strip()
        return json.loads(content)
    except Exception as e:
        print("⚠️ GPT 요청 중 오류:", e)
        return []
def main():
    all_quizzes = []

    if os.path.exists(GUIDE_FILE):
        guide_data = load_data(GUIDE_FILE)
        for item in guide_data:
            if item.get("cn"):
                quizzes = generate_quiz_from_content(item["cn"])
                all_quizzes.extend(quizzes)

    if os.path.exists(ACCIDENT_FILE):
        accident_data = load_data(ACCIDENT_FILE)
        for item in accident_data:
            if item.get("cn"):
                quizzes = generate_quiz_from_content(item["cn"])
                all_quizzes.extend(quizzes)

    # 저장
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_quizzes, f, ensure_ascii=False, indent=2)
    print(f"✅ 총 {len(all_quizzes)}개의 퀴즈를 생성했습니다.")

if __name__ == "__main__":
    main()
