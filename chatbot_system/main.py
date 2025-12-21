from fastapi import FastAPI
import uvicorn
from src.chatbot_system import ChatbotSystem

from src.tool import DatabaseTool
import os
import requests
import json
import os

# -----------------------------------------------------------------------------

# Hàm chuyên cho mô hình Qwen trong LM Studio
MODEL_NAME = os.getenv("CHATBOT_SYSTEM_MODEL_NAME", "qwen3/qwen3-8B")
LM_STUDIO_API = os.getenv("LM_STUDIO_API", "http://localhost:1234/v1/chat/completions")

def qwenStreamAnswers(chat_history):
    # chat_history là một list các object {"role": ..., "content": ...}

    # Nội dung dùng để gửi đến LM Studio
    payload = {
        "model": MODEL_NAME,
        "messages": chat_history,
        "temperature": 0.7,
        "stream": True,
    }
    
    # Nhận lại các token từ LLM
    with requests.post(LM_STUDIO_API, json=payload, stream=True) as response:
        for line in response.iter_lines(chunk_size=None):
            if not line:
                continue
            if line.startswith(b"data: "):
                data = line[len(b"data: ") :]
                if data == b"[DONE]":
                    yield None
                    break
                chunk = json.loads(data.decode("utf-8"))
                token = chunk["choices"][0]["delta"].get("content", "")
                # Output các token (: str).
                yield token

# -----------------------------------------------------------------------------

# Xâu kết nối tới Database
DB_CONNECTION_STRING = os.getenv(
    "DB_CONNECTION_STRING", "mongodb://localhost:27017/pbl4_db"
)

# Host và Port tới LLM
HOST = os.getenv("CHATBOT_SYSTEM_HOST", "localhost")
PORT = int(os.getenv("CHATBOT_SYSTEM_PORT", 37002))


if __name__ == "__main__":
    app = FastAPI() # Đối tượng dùng để host các API
    database_tool = DatabaseTool(connection_string=DB_CONNECTION_STRING) # Công cụ làm việc với Database
    # Tập hợp vòa đối tượng ChatbotSystem để phối hợp
    chatbot_system = ChatbotSystem(app, stream_function=qwenStreamAnswers, tools=[database_tool])
    uvicorn.run(app, host=HOST, port=PORT)
