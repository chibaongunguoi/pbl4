import requests
import json
import os

MODEL_NAME = os.getenv("CHATBOT_SYSTEM_MODEL_NAME", "qwen3/qwen3-4B")
LM_STUDIO_API = os.getenv("LM_STUDIO_API", "http://localhost:1234/v1/chat/completions")


def qwenStreamAnswers(chat_history):
    payload = {
        "model": MODEL_NAME,
        "messages": chat_history,
        "temperature": 0.7,
        "stream": True,
    }
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
                yield token
