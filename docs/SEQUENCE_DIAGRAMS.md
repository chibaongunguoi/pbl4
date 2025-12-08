# SƠ ĐỒ TUẦN TỰ HỆ THỐNG PBL4

## 1. Sơ đồ tuần tự - Đăng ký tài khoản

```plantuml
@startuml
actor "Người dùng" as User
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

User -> FE: Nhập thông tin đăng ký
FE -> API: POST /api/auth/register
API -> DB: Kiểm tra tên đăng nhập tồn tại
DB --> API: Kết quả kiểm tra
API -> DB: Tạo người dùng mới (vai trò="user")
DB --> API: Người dùng được tạo
API --> FE: Trả về thông tin người dùng (không có mã thông báo)
FE --> User: Hiển thị thành công

note right: Mã trạng thái:\n- 201: Thành công\n- 400: Dữ liệu không hợp lệ\n- 409: Tên đăng nhập đã tồn tại
@enduml
```

## 2. Sơ đồ tuần tự - Đăng nhập hệ thống

```plantuml
@startuml
actor "Người dùng" as User
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

User -> FE: Nhập tên đăng nhập/mật khẩu
FE -> API: POST /api/auth/login
API -> DB: Tìm người dùng theo tên đăng nhập
DB --> API: Dữ liệu tài khoản người dùng
API -> API: Kiểm tra mã băm mật khẩu
API -> API: Tạo mã thông báo xác thực
API --> FE: Trả về mã thông báo + thông tin người dùng
FE --> User: Lưu mã thông báo, chuyển trang

note right: Mã trạng thái:\n- 200: Thành công\n- 401: Sai thông tin đăng nhập\n- 400: Dữ liệu không hợp lệ
@enduml
```

## 3. Sơ đồ tuần tự - Ứng tuyển công việc

```plantuml
@startuml
actor "Người dùng" as User
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

User -> FE: Nhấn "Ứng tuyển"
FE -> API: POST /api/user/apply
note right: Tiêu đề: Ủy quyền: Bearer {mã thông báo}
API -> API: Xác thực mã thông báo
API -> DB: Kiểm tra người dùng đã ứng tuyển chưa
DB --> API: Kết quả kiểm tra
API -> DB: Tạo bản ghi User_company
DB --> API: Đơn ứng tuyển được tạo
API --> FE: Thành công
FE --> User: Hiển thị thông báo

note right: Mã trạng thái:\n- 201: Thành công\n- 401: Chưa đăng nhập\n- 409: Đã ứng tuyển rồi
@enduml
```

## 4. Sơ đồ tuần tự - Tạo bài đăng công việc (Công ty)

```plantuml
@startuml
actor "Công ty" as Company
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

Company -> FE: Nhập thông tin công việc
FE -> API: POST /api/jobDetail
API -> API: Xác thực trường bắt buộc (job_title)
API -> API: Tạo slug URL duy nhất
API -> DB: Tạo bản ghi JobDetail
DB --> API: Công việc được tạo
API --> FE: Trả về dữ liệu công việc
FE --> Company: Hiển thị thành công

note right: Trường bắt buộc:\n- job_title\nTùy chọn: company_name, province, salary, skills, v.v.
@enduml
```

## 5. Sơ đồ tuần tự - Thu thập dữ liệu việc làm (Quản trị viên)

```plantuml
@startuml
actor "Quản trị viên" as Admin
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "Dịch vụ thu thập" as Scraper
participant "MongoDB" as DB

Admin -> FE: Nhập URL nguồn
FE -> Scraper: Gọi trực tiếp API thu thập
Scraper -> Scraper: Khởi tạo spider Scrapy
Scraper -> Scraper: Thu thập dữ liệu từ URL
Scraper -> DB: Lưu bản ghi JobDetail
DB --> Scraper: Dữ liệu được lưu
Scraper -> FE: Trả về kết quả thu thập
FE --> Admin: Hiển thị kết quả

note right: Dịch vụ thu thập:\n- Chạy riêng biệt trên cổng 37001\n- Python + Scrapy\n- Xử lý bất đồng bộ
@enduml
```

## 6. Sơ đồ tuần tự - Tìm kiếm công việc

```plantuml
@startuml
actor "Người dùng" as User
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

User -> FE: Nhập từ khóa tìm kiếm
FE -> API: GET /api/search
note right: Tham số truy vấn: q, province, salary
API -> DB: Truy vấn bộ sưu tập JobDetail
note right: Bộ lọc: tìm kiếm văn bản, tỉnh, khoảng lương
DB --> API: Kết quả công việc
API -> API: Định dạng phản hồi
API --> FE: Trả về danh sách công việc
FE --> User: Hiển thị kết quả

note right: Tính năng tìm kiếm:\n- Tìm kiếm toàn văn\n- Lọc theo tỉnh\n- Sắp xếp theo ngày/lương\n- Phân trang
@enduml
```

## 7. Sơ đồ tuần tự - Xem và duyệt đơn ứng tuyển (Công ty)

```plantuml
@startuml
actor "Công ty" as Company
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

Company -> FE: Truy cập trang ứng tuyển
FE -> API: GET /api/company/applications
note right: Tiêu đề: Cookie mã thông báo xác thực
API -> API: Xác thực vai trò công ty
API -> DB: Truy vấn bản ghi User_company
note right: Lọc theo công việc của công ty
DB --> API: Danh sách đơn ứng tuyển với dữ liệu đã điền
API --> FE: Trả về đơn ứng tuyển
FE --> Company: Hiển thị danh sách

Company -> FE: Nhấn duyệt/từ chối
FE -> API: PUT /api/user/apply/{id}
note right: Nội dung: {status: "đã duyệt|đã từ chối"}
API -> API: Xác thực vai trò công ty
API -> DB: Cập nhật trạng thái User_company
DB --> API: Trạng thái được cập nhật
API -> DB: Tạo bản ghi Thông báo
DB --> API: Thông báo được tạo
API --> FE: Thành công
FE --> Company: Cập nhật giao diện người dùng

note right: Giá trị trạng thái:\n- chưa duyệt\n- đã duyệt\n- đã từ chối\nTự động tạo thông báo
@enduml
```

## 8. Sơ đồ tuần tự - Quản lý thông báo

```plantuml
@startuml
actor "Người dùng" as User
participant "Giao diện người dùng" as FE
participant "Cổng API" as API
participant "MongoDB" as DB

== Tạo thông báo ==
API -> DB: Tạo bản ghi Thông báo
note right: Tự động kích hoạt khi:\n- Trạng thái đơn ứng tuyển được cập nhật\n- Đơn ứng tuyển được gửi

== Xem thông báo ==
User -> FE: Mở trang thông báo
FE -> API: GET /api/user/notifications
API -> DB: Truy vấn thông báo
DB --> API: Danh sách thông báo
API --> FE: Trả về dữ liệu
FE --> User: Hiển thị thông báo

== Đánh dấu đã đọc ==
User -> FE: Nhấn thông báo
FE -> API: PUT /api/user/notifications/{id}
API -> DB: Cập nhật trạng thái
DB --> API: Đã cập nhật
API --> FE: Thành công

note right: Loại thông báo:\n- Trạng thái đơn ứng tuyển\n- Công việc mới phù hợp kỹ năng\n- Thông báo hệ thống
@enduml
```
