# Hướng dẫn thử nghiệm

## Giới thiệu

- File `main.py`: Giả lập hộp thoại chatbot bằng giao diện dòng lệnh
- File `database.py`: API tiếp nhận yêu cầu truy vấn database, và trả về kết quả từ database

## Cách thử nghiệm

- Tải và host "qwen3/qwen3-4b" trên LM Studio.
- Cài đặt các package python trong `requirements.txt`
- Chạy database `mongodb` (cổng 27017)
- Chạy file `database.py` (cổng 37111)
- Chạy file `main.py` (chatbot)
