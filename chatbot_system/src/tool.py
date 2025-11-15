import re
import subprocess
import traceback
from .util import removeConsecutiveSpaces


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

    def process(self, response: str):
        content = removeTags(self.tag, response)
        if content is None:
            return False, []
        dialogs = self.__call__(content)
        return True, dialogs

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

    def __call__(self, content: str):
        content = content
        raise NotImplementedError()


class DatabaseTool(Tool):
    def __init__(self, connection_string: str):
        super().__init__("query")
        self.tag = "query"
        self.connection_string = connection_string

    def executeQuery(self, query: str):
        try:
            if any(
                c in query.lower()
                for c in ["insert", "delete", "drop", "update", "upsert"]
            ):
                return {"error": "Invalid query."}

            cmd = [
                "mongosh",
                "--eval",
                query,
                self.connection_string,
                "--quiet",
            ]
            result = subprocess.run(
                cmd, capture_output=True, text=True, encoding="utf-8"
            )
            result = result.stdout
            result = removeConsecutiveSpaces(result)
            result = result.replace("\\n", " ")
            result = result.replace("\n", " ")
            return result
        except Exception:
            traceback.print_exc()
        return {"result": "ERROR"}

    def __call__(self, content: str):
        query = content
        result = self.executeQuery(query)

        # user_msg = ""
        # if result:
        #     assistant_msg = "Đã có kết quả truy vấn. Tôi sẽ trình bày cho bạn các kết quả mà tôi đã đọc được. Tôi sẽ chỉ dựa vào đó để trả lời."
        #     user_msg = "Cho tôi biết các kết quả truy vấn ngay bây giờ. Nếu kết quả là các việc làm thì phải có tên của công việc,đính kèm URL của các công việc đó. Không được nguỵ tạo dữ liệu giả. Trình bày càng nhiều kết quả nhất có thể, tối đa 5 kết quả."
        #
        # else:
        #     assistant_msg = "Không tìm thấy kết quả, tôi đã truy vấn sai, hãy để tôi truy vấn một câu khác."
        #     user_msg = "Nếu truy vấn bằng ID, bạn bắt buộc phải dùng ObjectId(''), cấm dùng \"ObjectId('')\". Tiếp tục công việc của bạn."

        dialogs = [
            {
                "role": "user",
                "content": f"<result>Kết quả truy vấn: {result}</result>",
            },
            # {
            #     "role": "assistant",
            #     "content": assistant_msg,
            # },
            # {
            #     "role": "user",
            #     "content": user_msg,
            # },
        ]
        return dialogs
