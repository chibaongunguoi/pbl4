from fastapi import FastAPI
import uvicorn
from src.llm_access import LLMAccess
from src.chatbot_system import ChatbotSystem
from src.qwen import qwenStreamAnswers
from src.tool import DatabaseTool
import os

DB_CONNECTION_STRING = os.getenv(
    "DB_CONNECTION_STRING", "mongodb://localhost:27017/pbl4_db"
)
HOST = os.getenv("CHATBOT_SYSTEM_HOST", "localhost")
PORT = int(os.getenv("CHATBOT_SYSTEM_PORT", 37002))

print("DB_CONNECTION_STRING:", DB_CONNECTION_STRING)


if __name__ == "__main__":
    app = FastAPI()
    database_tool = DatabaseTool(connection_string=DB_CONNECTION_STRING)
    llm_access = LLMAccess(stream_function=qwenStreamAnswers)
    chatbot_system = ChatbotSystem(app, llm_access=llm_access, tools=[database_tool])
    uvicorn.run(app, host=HOST, port=PORT)
