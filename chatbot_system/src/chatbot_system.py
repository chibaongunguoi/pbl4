from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
import json
import traceback
from .tool import Tool
import asyncio
from typing import Callable


class ChatbotSystem:
    def __init__(
        self,
        app: FastAPI,
        stream_function: Callable, # Hàm nhận lại các token từ LLM
        tools: list[Tool], # Danh sách các công cụ, chẳng hạn như công cụ truy vấn CSDL
    ):
        self.stream_function = stream_function
        self.tools = tools

        # Nạp system_message
        with open("data/system_message.txt", encoding="utf-8") as f:
            self.system_message = f.read()

        # Set up các ÁPI để nhận các yêu cầu từ phía bên ngoài, bao gồm:
        # - Khởi tạo đoạn chat mới: Trả về lịch sử chat chỉ chứa system_message
        app.add_api_route(
            "/api/new_chat_history", self.apiNewChatHistory, methods=["POST"]
        )
        # - Nhận vào một danh sách lịch sử chat, trả về kết quả từ LLM
        app.add_api_route("/api/upload", self.apiUpload, methods=["POST"])

    def newChatHistory(self):
        return [{"role": "system", "content": self.system_message}]

    async def apiNewChatHistory(self, _: Request):
        try:
            return JSONResponse(
                status_code=200, content={"chat_history": self.newChatHistory()}
            )
        except Exception:
            traceback.print_exc()
            return JSONResponse(status_code=500, content={"result": "ERROR"})

    async def apiUpload(self, request: Request):
        try:
            data = await request.json()
            chat_history = data["chat_history"]
            streamer = self.getApiUploadStreamer(chat_history)
            return StreamingResponse(streamer(), media_type="text/plain")

        except Exception:
            traceback.print_exc()
            return JSONResponse(status_code=500, content={"result": "ERROR"})

    # streamer này sẽ được gửi về người dùng
    def getApiUploadStreamer(self, chat_history):
        chat_history = list(chat_history)

        # Tạo một streamer chuyên đi nhận token từ LLM
        async def llm_streamer():
            queue = asyncio.Queue()
            loop = asyncio.get_running_loop()

            def stream_function_wrapper(loop):
                for token in self.stream_function(chat_history):
                    asyncio.run_coroutine_threadsafe(queue.put(token), loop)

            # Các token từ LLM sẽ được nhận về mà không phụ thuộc
            # vào tiến độ của việc trả token về người dùng
            # Nếu không thì token mới sẽ chỉ được nhận sau khi token cũ được gửi đến người dùng.
            asyncio.get_running_loop().run_in_executor(
                None, stream_function_wrapper, loop
            )

            while True:
                token = await queue.get()
                if token is None:
                    break
                yield token

        # streamer này sẽ được gửi về người dùng
        async def streamer():
            answer_again = True
            while answer_again:
                llm_response = ""
                async for token in llm_streamer():
                    llm_response += token
                    ret = {"type": "token", "token": token}
                    yield json.dumps(ret, ensure_ascii=False)

                chat_history.append({"role": "assistant", "content": llm_response})
                answer_again = False
                original_chat_history_len = len(chat_history)
                for tool in self.tools:
                    # Nhận lại các đoạn hội thoại sinh ra bởi công cụ
                    answer_again, dialogs = tool.process(llm_response)
                    chat_history.extend(dialogs)
                    if answer_again:
                        break

                if len(chat_history) > original_chat_history_len:
                    ret = {
                        "type": "chat_history",
                        "new_chat_history": chat_history[original_chat_history_len:],
                    }
                    yield json.dumps(ret, ensure_ascii=False)

        return streamer

