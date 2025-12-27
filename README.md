# Cách triển khai dự án

## Yêu cầu kĩ thuật

- Một instance Ubuntu Live Server (24.04.3 LTS hoặc 25.10) để chạy các chương trình trong repo Github của dự án.
- Một dịch vụ chatbot có các API theo format của OpenAI. Có thể sử dụng LM Studio để chạy
dịch vụ chatbot trên chính instance của mình.
-Khuyến nghị: Sử dụng hệ thống ảo hóa VirtualBox, với kết nối mạng của instance máy ảo được cấu hình là "Attach to: Bridged Adapter".
Một instance khác trong mạng được cài đặt LM Studio, và tải về các mô hình `qwen/qwen3-4b` (~ 2.5 GB) hoặc `qwen/qwen3-8b` (~ 5.0 GB).

## Hướng dẫn cài đặt

- Tại thư mục `~/` của instance Ubuntu Live Server (được nhắc đến đầu tiên trong phần "Yêu cầu kĩ thuật"). Dùng `git` để
tải về code của dự án, sau đó là chạy các lệnh để cài đặt các gói phần mềm cần thiết. Cụ thể, các lệnh đó là như sau:

```bash
git clone https://github.com/chibaongunguoi/pbl4.git
cd pbl4
chmod +x ubuntu/* scripts/*
ubuntu/install.sh  # Cài đặt các dependencies
```

Lưu ý: Để sử dụng chatbot thì cần đảm bảo LM Studio hoặc dịch vụ cung cấp chatbot phải hoạt động.

Nếu có sử dụng chatbot thì cần phải ghi chú địa chỉ dùng để cấp dịch vụ chatbot.
Sau đó, tiến hành cấu hình cac biến môi trường liên quan tới chúng thông qua lệnh

```bash
nano scripts/env.sh
```

Các biến môi trường có khả năng phải thay đổi nhất là `CHATBOT_SYSTEM_MODEL_NAME` (tên mô hình của chatbot)
và `LM_STUDIO_API`, trở tới nguồn cấp dịch vụ chatbot.


Trước khi chạy các chương trình trong instance này, cần phải ghi chú IP của máy ảo.

Để chạy các chương trình trong dự án, sử dụng lệnh:

```bash
ubuntu/run.sh
```

Và dùng một trình duyệt web ở một máy trong mạng để truy cập vào cổng `3000` của máy ảo.
