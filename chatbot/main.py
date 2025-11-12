import requests
import json
from src.one_tools import Tool, DatabaseTool
import sys

URL_PREFIX = "http://127.0.0.1:1234/v1"
MODEL_NAME = "qwen3/qwen3-4b"
# MODEL_NAME = "meta-llama-3-8b-instruct"
# BACKSPACE = "\033[1D\033[P"
BACKSPACE = "\033[1D\033[P\033[1C"


class ChatEnvironment:
    def __init__(self):
        with open("system_message.txt", encoding="utf-8") as f:
            system_message = f.read()
        self.chat_history = [
            {
                "role": "system",  # add /no_think at the beginning of the system message
                "content": system_message,
            },
        ]

    def startChat(self):
        while True:
            sys.stdout.write("[USER:] ")
            sys.stdout.flush()
            user_message = input()
            if "bye" in user_message:
                break
            user_message = user_message.strip()
            self.chat_history.extend(
                [
                    {
                        "role": "user",
                        "content": f"""{user_message}""",
                    },
                ]
            )
            self.response()

    def response(self):
        tools: list[Tool] = [DatabaseTool()]

        answer_again = True
        while answer_again:
            is_streaming = True
            response = []
            sys.stdout.write("[ASSISTANT:] ")
            sys.stdout.flush()
            buffer = ""
            for token in self.streamChatbotAnswers():
                response.append(token)
                buffer += token
                # for tool in tools:
                #     check = tool.checkSpecialTags(buffer)
                #     if check is not None:
                #         buffer = ""
                #         is_streaming = check
                #         if not check:
                #             sys.stdout.write(BACKSPACE * len(tool.getOpenTag()))
                #             sys.stdout.flush()

                if is_streaming:
                    sys.stdout.write(token)
                    sys.stdout.flush()

            print()
            # last_user_msg = self.chat_history[-1]
            # if removeTags("result", last_user_msg["content"]) is not None:
            #     print("[One-INFO] Removed the last user's message.")
            #     self.chat_history.pop()

            response = "".join(response)
            self.chat_history.append({"role": "assistant", "content": response})

            answer_again = False
            for tool in tools:
                answer_again = answer_again or tool.process(response, self.chat_history)
                if answer_again:
                    break

    def streamChatbotAnswers(self, temperature: float = 0.7):
        url = f"{URL_PREFIX}/chat/completions"
        payload = {
            "model": MODEL_NAME,
            "messages": self.chat_history,
            "temperature": temperature,
            "stream": True,
        }
        is_searching_for_printable_tokens = False
        is_ready_for_chat = True
        with requests.post(url, json=payload, stream=True) as response:
            for line in response.iter_lines():
                if not line:
                    continue
                if line.startswith(b"data: "):
                    data = line[len(b"data: ") :]
                    if data == b"[DONE]":
                        break
                    chunk = json.loads(data.decode("utf-8"))

                    token = chunk["choices"][0]["delta"].get("content", "")

                    if token.isprintable() and is_searching_for_printable_tokens:
                        is_ready_for_chat = True
                    #
                    # if token == "<think>":
                    #     is_ready_for_chat = False
                    #     sys.stdout.write(BACKSPACE * len("<think>"))
                    #
                    # if token == "</think>":
                    #     is_searching_for_printable_tokens = True

                    if token and is_ready_for_chat:
                        yield token


if __name__ == "__main__":
    chat_environment = ChatEnvironment()
    chat_environment.startChat()
