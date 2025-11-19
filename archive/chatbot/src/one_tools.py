import re
import requests


def removeTags(tag: str, content: str):
    pattern = f"<{tag}>(.*?)</{tag}>"
    matches = re.findall(pattern, content, re.DOTALL)
    if not matches:
        return None
    result = matches[-1]
    result = result.strip()
    return result


class Tool:
    def __init__(self, tag):
        self.tag = tag

    def process(self, response: str, chat_history: list) -> bool:
        content = removeTags(self.tag, response)
        if content is None:
            return False
        self.__call__(content, chat_history)
        return True

    def getOpenTag(self):
        return f"<{self.tag}>"

    def getCloseTag(self):
        return f"/<{self.tag}>"

    def checkSpecialTags(self, buffer: str) -> bool | None:
        if buffer.find(self.getOpenTag()) != -1:
            return False

        if buffer.find(self.getCloseTag()) != -1:
            return True

        return None

    def __call__(self, content: str, chat_history: list):
        content, chat_history = content, chat_history
        raise NotImplementedError()


class DatabaseTool(Tool):
    def __init__(self):
        super().__init__("query")
        self.url = "http://localhost:37111/api/query"

    def __call__(self, content: str, chat_history: list) -> None:
        print("- Truy vấn cơ sở dữ liệu...")

        data = {"query": content}
        response = requests.post(self.url, json=data)
        response = response.json()
        response = response["result"]

        user_msg = ""
        if response:
            assistant_msg = "Đã có kết quả truy vấn. Tôi sẽ trình bày cho bạn các kết quả mà tôi đã đọc được. Tôi sẽ chỉ dựa vào đó để trả lời."
            user_msg = "Cho tôi biết các kết quả truy vấn ngay bây giờ. Nếu kết quả là các việc làm thì phải có tên của công việc,đính kèm URL của các công việc đó. Không được nguỵ tạo dữ liệu giả. Trình bày càng nhiều kết quả nhất có thể, tối đa 5 kết quả."

        else:
            assistant_msg = "Không tìm thấy kết quả, tôi đã truy vấn sai, hãy để tôi truy vấn một câu khác."
            user_msg = "Nếu truy vấn bằng ID, bạn bắt buộc phải dùng ObjectId(''), cấm dùng \"ObjectId('')\". Tiếp tục công việc của bạn."

        new_dialogs = [
            {
                "role": "user",
                "content": f"Kết quả truy vấn: <result>{response}</result>.",
            },
            {
                "role": "assistant",
                "content": assistant_msg,
            },
            {"role": "user", "content": user_msg},
        ]
        print(new_dialogs)
        chat_history.extend(new_dialogs)
        print("- Đã có kết quả truy vấn.")
