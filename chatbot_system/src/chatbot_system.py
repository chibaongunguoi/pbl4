from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from .llm_access import LLMAccess
import json
import traceback
from .tool import Tool


class ChatbotSystem:
    def __init__(
        self,
        app: FastAPI,
        llm_access: LLMAccess,
        tools: list[Tool],
    ):
        self.llm_access = llm_access
        self.tools = tools

        with open("data/system_message_1.txt", encoding="utf-8") as f:
            self.system_message = f.read()

        app.add_api_route(
            "/api/new_chat_history", self.apiNewChatHistory, methods=["POST"]
        )
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

    def getApiUploadStreamer(self, chat_history):
        chat_history = list(chat_history)

        async def streamer():
            answer_again = True
            while answer_again:
                llm_streamer = self.llm_access.getStreamer(chat_history)
                llm_response = ""
                async for token in llm_streamer():
                    llm_response += token
                    print(token, end="", flush=True)
                    ret = {"type": "token", "token": token}
                    yield json.dumps(ret, ensure_ascii=False)

                chat_history.append({"role": "assistant", "content": llm_response})
                answer_again = False
                original_chat_history_len = len(chat_history)
                for tool in self.tools:
                    answer_again, dialogs = tool.process(llm_response)
                    chat_history.extend(dialogs)
                    if answer_again:
                        break

                if len(chat_history) > original_chat_history_len:
                    print("\n\n")
                    print(
                        chat_history[original_chat_history_len:], end="\n\n", flush=True
                    )
                    ret = {
                        "type": "chat_history",
                        "new_chat_history": chat_history[original_chat_history_len:],
                    }
                    yield json.dumps(ret, ensure_ascii=False)

        return streamer

    async def apiUpload(self, request: Request):
        try:
            data = await request.json()
            chat_history = data["chat_history"]
            streamer = self.getApiUploadStreamer(chat_history)
            return StreamingResponse(streamer(), media_type="text/plain")

        except Exception:
            traceback.print_exc()
            return JSONResponse(status_code=500, content={"result": "ERROR"})
