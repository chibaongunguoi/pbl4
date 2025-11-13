# Cách triển khai dự án

## Giới thiệu

Dự án gồm có các thành phần như sau:

- Fullstack Client-Server (port 3000)
- MongoDB Database (port 27017)
- Web Scraper (port 37222)
- LM Studio Chatbot Hosting (port 1234)
- Chatbot System (port 37111)

## Hướng dẫn deploy

- Thiết lập biến môi trường bằng git bash

```bash
# Đứng tại thư mục gốc của dự án
source env.sh
```

- Chạy ngầm MongoDB Database.
- Chạy Web Scraper như sau:

```bash
# Đứng tại thư mục gốc của dự án
cd scraper
pip install -r requirements.txt # Cài các package cần thiết
python main.py
```

- Chạy LM Studio Chatbot
- Chạy Chatbot System

```bash
# Đứng tại thư mục gốc của dự án
cd chatbot_system
pip install -r requirements.txt # Cài các package cần thiết
python main.py
```

## Hướng dẫn test

- Trước hết, tải `k6.exe` (trong file zip) rồi thêm vào PATH.

```bash
# Đứng tại thư mục gốc của dự án
cd client_server
npm run build
node cluster.js
```

Tại một terminal khác:

```bash
./test.sh
```
