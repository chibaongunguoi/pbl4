# PBL4

## Lời nói đầu

Trong thời đại số hóa, việc tìm kiếm việc làm phù hợp và kết nối giữa ứng viên với nhà tuyển dụng vẫn còn nhiều khó khăn. Ứng viên thường phải truy cập nhiều trang web, điền thông tin lặp đi lặp lại, và không nhận được phản hồi kịp thời. Ngược lại, các công ty cũng gặp khó khăn trong việc quản lý hồ sơ ứng viên, đăng tin tuyển dụng hiệu quả, và tiếp cận đúng người tài.

Vì vậy, để giải quyết những vấn đề trên thì cần có một nền tảng kết nối việc làm thông minh, thân thiện và hiện đại. Dự án ra đời với mong muốn giúp ứng viên dễ dàng tìm kiếm, ứng tuyển, theo dõi trạng thái hồ sơ, đồng thời hỗ trợ doanh nghiệp quản lý tuyển dụng một cách chuyên nghiệp, tiết kiệm thời gian và chi phí.

Với giải pháp này, hành trình tìm việc và tuyển dụng sẽ trở nên dễ dàng, minh bạch và hiệu quả hơn bao giờ hết.

## Các đối tượng và chức năng của dự án

Hệ thống phục vụ ba nhóm đối tượng chính: Người dùng (ứng viên), Công ty (nhà tuyển dụng), và Quản trị viên. Mục tiêu là mang đến trải nghiệm đơn giản cho ứng viên, công cụ quản lý hiệu quả cho công ty, và khả năng giám sát, duy trì cho đội ngũ quản trị.

### Người dùng (Ứng viên)

- Tạo và quản lý hồ sơ cá nhân: điền thông tin, tải CV, cập nhật kỹ năng và kinh nghiệm.
- Tìm kiếm việc làm: lọc theo từ khóa, địa điểm, kỹ năng, mức lương.
- Xem chi tiết công việc: mô tả công việc, yêu cầu, thông tin công ty.
- Ứng tuyển trực tuyến: gửi hồ sơ nhanh chóng mà không phải lặp lại nhiều lần.
- Theo dõi công việc và trạng thái ứng tuyển: biết được trạng thái được xét duyệt, từ chối hoặc cần bổ sung thông tin.
- Nhận thông báo: hệ thống gửi thông báo về các thay đổi trạng thái ứng tuyển hoặc thông tin liên quan đến công việc mà người dùng quan tâm.

Lợi ích: giúp ứng viên tiết kiệm thời gian, quản lý hồ sơ rõ ràng và nâng cao cơ hội tìm được việc phù hợp.

### Công ty (Nhà tuyển dụng)

- Tạo và quản lý hồ sơ công ty: cập nhật thông tin, logo, liên hệ.
- Đăng và chỉnh sửa tin tuyển: dễ dàng đăng tin mới, cập nhật thông tin tuyển dụng.
- Quản lý đơn ứng tuyển: xem danh sách ứng viên, duyệt hoặc từ chối ứng tuyển, lưu trữ hồ sơ.
- Theo dõi hiệu suất tin tuyển: nắm thông tin số lượng ứng viên, trạng thái xử lý.

Lợi ích: giúp công ty tuyển dụng chuyên nghiệp hơn, giảm thời gian xử lý hồ sơ và tiếp cận ứng viên phù hợp.

### Quản trị viên

- Quản lý tổng thể nền tảng: quản lý người dùng, công ty, tin tuyển, và dữ liệu hệ thống.
- Giám sát và xử lý: kiểm duyệt nội dung, xử lý báo cáo và sự cố kỹ thuật.
- Quản lý thông báo và lịch sử: theo dõi thông báo hệ thống, lịch sử tương tác và các hoạt động quan trọng.
- Công cụ hỗ trợ vận hành: cài đặt, cấu hình các tác vụ theo dõi, và truy xuất dữ liệu khi cần.

Lợi ích: đảm bảo nền tảng hoạt động ổn định, an toàn và dữ liệu minh bạch cho người dùng và doanh nghiệp.

### Ghi chú về các công cụ mở rộng (dành cho Quản trị viên)

Hệ thống có tích hợp hai công cụ mở rộng dành riêng cho quản trị viên: Trợ lý AI (Chatbot) và Trình thu thập việc làm (Scraper). Hai công cụ này được coi là tiện ích vận hành—chỉ quản trị viên mới có quyền truy cập và sử dụng để hỗ trợ quản lý dữ liệu, kiểm duyệt và cải thiện chất lượng nguồn việc làm.

- Trợ lý AI (Chatbot): hỗ trợ xử lý câu hỏi phổ biến, rà soát nội dung cần kiểm duyệt và cung cấp trợ giúp nội bộ cho quản trị viên.
- Trình thu thập việc làm (Scraper): thu thập thông tin việc làm từ các nguồn công khai để bổ sung vào cơ sở dữ liệu; quản trị viên kiểm soát tần suất và nguồn lấy dữ liệu.

Những tiện ích này không thay đổi quyền hạn hoặc trải nghiệm của ứng viên và công ty — chúng là các công cụ nội bộ để giúp quản trị vận hành nền tảng tốt hơn.

## Sơ đồ Use Case

### Use Case Tổng quan

```plantuml
@startuml
skinparam usecaseFontSize 12
skinparam usecasePadding 6
skinparam nodesep 20
skinparam ranksep 20
left to right direction
actor "Người dùng" as U
actor "Công ty" as C
actor "Quản trị viên" as A

rectangle "Hệ thống" {
    usecase "Xác thực" as UC_Auth
    usecase "Quản lý hồ sơ" as UC_ProfileMgmt
    usecase "Tìm kiếm & Ứng tuyển" as UC_JobSearchApply
    usecase "Quản lý công ty" as UC_CompanyMgmt
    usecase "Đăng tuyển dụng" as UC_PostJobOverall
    usecase "Duyệt ứng tuyển" as UC_ApplicationReview
    usecase "Quản trị hệ thống" as UC_SystemAdmin
    usecase "Quản lý người dùng" as UC_UserMgmt
    usecase "Quản lý việc làm" as UC_ContentMgmt
}

U --> UC_Auth
U --> UC_ProfileMgmt
U --> UC_JobSearchApply
 

C --> UC_CompanyMgmt
C --> UC_ApplicationReview
C --> UC_PostJobOverall

A --> UC_SystemAdmin
A --> UC_UserMgmt
A --> UC_ContentMgmt

A --> UC_PostJobOverall
 
@enduml

```

### Use Case Chi tiết - Người dùng

```plantuml
@startuml
skinparam usecaseFontSize 12
skinparam usecasePadding 6
skinparam nodesep 20
skinparam ranksep 20
left to right direction
actor "Người dùng" as U
rectangle "Hệ thống" {
    usecase "Đăng ký tài khoản" as UC_Register
    usecase "Đăng nhập" as UC_Login
    usecase "Đăng xuất" as UC_Logout
    usecase "Cập nhật thông tin cá nhân" as UC_UpdateProfile
    usecase "Đổi mật khẩu" as UC_ChangePassword
    usecase "Tìm kiếm việc làm" as UC_SearchJobs
    usecase "Xem chi tiết công việc" as UC_ViewJobDetails
    usecase "Ứng tuyển" as UC_ApplyJob
    usecase "Theo dõi công việc" as UC_FollowJob
    usecase "Hủy theo dõi công việc" as UC_UnfollowJob
    usecase "Xem công việc đã theo dõi" as UC_ViewFollowedJobs
    
    usecase "Xem thông báo" as UC_ViewNotifications
    usecase "Xem trạng thái ứng tuyển" as UC_ViewApplicationStatus
}

U --> UC_Register
U --> UC_Login
U --> UC_Logout
U --> UC_UpdateProfile
U --> UC_ChangePassword
U --> UC_SearchJobs
U --> UC_ViewJobDetails
U --> UC_ApplyJob
U --> UC_FollowJob
U --> UC_UnfollowJob
U --> UC_ViewFollowedJobs
 
U --> UC_ViewNotifications
U --> UC_ViewApplicationStatus

 

@enduml
```

### Use Case Chi tiết - Công ty

```plantuml
@startuml
skinparam usecaseFontSize 12
skinparam usecasePadding 6
skinparam nodesep 20
skinparam ranksep 20
left to right direction
actor "Công ty" as C
rectangle "Hệ thống" {
    
    usecase "Đăng nhập (Công ty)" as UC_LoginCompany
    usecase "Cập nhật hồ sơ công ty" as UC_UpdateCompanyProfile
    usecase "Xem công việc của công ty" as UC_ViewCompanyJobs
    usecase "Xem đơn ứng tuyển" as UC_ViewJobApplications
    usecase "Duyệt ứng tuyển" as UC_ApproveApplication
    usecase "Từ chối ứng tuyển" as UC_RejectApplication
    usecase "Xóa đơn ứng tuyển" as UC_DeleteApplication
    usecase "Đăng tuyển dụng" as UC_PostJob
}

C --> UC_PostJob
C --> UC_LoginCompany
C --> UC_UpdateCompanyProfile
C --> UC_ViewCompanyJobs
C --> UC_ViewJobApplications
C --> UC_ApproveApplication
C --> UC_RejectApplication
    C --> UC_DeleteApplication

 

@enduml
```

### Use Case Chi tiết - Quản trị viên

```plantuml
@startuml
skinparam usecaseFontSize 12
skinparam usecasePadding 6
skinparam nodesep 20
skinparam ranksep 20
left to right direction
actor "Quản trị viên" as A
rectangle "Hệ thống" {
    usecase "Đăng nhập (Quản trị)" as UC_LoginAdmin
    usecase "Quản lý người dùng" as UC_ManageUsers
    usecase "Tạo người dùng" as UC_CreateUser
    usecase "Cập nhật người dùng" as UC_UpdateUser
    usecase "Xóa người dùng" as UC_DeleteUser
    usecase "Quản lý công ty" as UC_ManageCompanies
    usecase "Tạo công ty" as UC_CreateCompany
    usecase "Cập nhật công ty" as UC_UpdateCompany
    usecase "Xóa công ty" as UC_DeleteCompany
    usecase "Xem tất cả công việc" as UC_ViewAllJobs
    usecase "Tạo công việc" as UC_AdminCreateJob
    usecase "Xóa công việc" as UC_DeleteJob
    usecase "Quản lý thông báo" as UC_ManageNotifications
    usecase "Xem lịch sử chat" as UC_ViewChatHistoryAdmin
    usecase "Xóa lịch sử chat" as UC_DeleteChatHistory
    usecase "Sử dụng trợ lý AI" as UC_ChatAIAdmin
    usecase "Sử dụng Scraper" as UC_ViewScraperJobs
    usecase "Giám sát hệ thống" as UC_MonitorSystem
}

A --> UC_LoginAdmin
A --> UC_ManageUsers
A --> UC_CreateUser
A --> UC_UpdateUser
A --> UC_DeleteUser
A --> UC_ManageCompanies
A --> UC_CreateCompany
A --> UC_UpdateCompany
A --> UC_DeleteCompany
A --> UC_ViewAllJobs
A --> UC_DeleteJob
A --> UC_AdminCreateJob
A --> UC_ManageNotifications
A --> UC_ViewChatHistoryAdmin
A --> UC_DeleteChatHistory
A --> UC_ViewScraperJobs
A --> UC_MonitorSystem
A --> UC_ChatAIAdmin

 

@enduml
```

## Sơ đồ thực thể

```mermaid
erDiagram
    User ||--o{ UserProfile : "has"
    User ||--o{ Follow : "follows"
    User ||--o{ ChatHistory : "owns"
    User ||--o{ Notification : "receives"
    User ||--o{ User_company : "applies_via"
    User ||--o{ Company : "manages"
    Company ||--o{ JobDetail : "owns_jobs"
    JobDetail ||--o{ Follow : "is_followed_by"
    JobDetail ||--o{ Notification : "notifies_about"
    JobDetail ||--o{ User_company : "receives_applications"
    ScrapeJob
```

## Cấu trúc cơ sở dữ liệu

### Bảng User

```mermaid
erDiagram
    User {
        string _id PK
        string username UK
        string password
        string role "admin|user|company"
    }
```

### Bảng UserProfile

```mermaid
erDiagram
    UserProfile {
        string _id PK
        string name
        string phone
        string gender "nam|nữ"
        datetime birthdate
        string cv
        string description
        string username FK
    }
```

### Bảng Company

```mermaid
erDiagram
    Company {
        string _id PK
        string name UK
        string email UK
        string phone
        string website
        string logo
        string description
        string address
        string username FK
        datetime createdAt
        datetime updatedAt
    }
```

### Bảng JobDetail

```mermaid
erDiagram
    JobDetail {
        string _id PK
        string url UK
        string thumbnail
        string job_title
        string company_url
        string company_name
        string province
        string salary
        array skills
        map descriptions
        map job_info
        datetime collected_at
    }
```

### Bảng ChatHistory

```mermaid
erDiagram
    ChatHistory {
        string _id PK
        string userId
        array messages
        datetime createdAt
        datetime updatedAt
    }
```

### Bảng Follow

```mermaid
erDiagram
    Follow {
        string _id PK
        string userId FK
        string jobId
        datetime createdAt
    }
```

### Bảng Notification

```mermaid
erDiagram
    Notification {
        string _id PK
        string userID FK
        string JobDetailID FK
        string content
        string status "chưa đọc|đã đọc"
        datetime createdAt
        datetime updatedAt
    }
```

### Bảng User_company

```mermaid
erDiagram
    User_company {
        string _id PK
        string userID FK
        string JobDetailID FK
        string status "chưa duyệt|đã duyệt|đã từ chối"
        datetime time
        string applicationID UK
        datetime createdAt
        datetime updatedAt
    }
```

### Bảng ScrapeJob

```mermaid
erDiagram
    ScrapeJob {
        string _id PK
        string url
        string status "pending|processing|completed|failed"
        number jobCount
        string errorMessage
        object metadata
        datetime createdAt
        datetime completedAt
    }

```

## Kiến trúc dự án

```mermaid
graph TB
    subgraph "Lớp Frontend"
        A["Ứng dụng Next.js<br/>Cổng: 3000"]
    end

    subgraph "Lớp API Gateway"
    B["API Next.js<br/>/api/*"]
    end

    subgraph "Dịch vụ Backend"
        C["Hệ thống Chatbot<br/>FastAPI<br/>Port: 37002"]
        D["Hệ thống Scraper<br/>Python<br/>Port: 37001"]
    end

    subgraph "Lớp dữ liệu"
        E["MongoDB<br/>Port: 27017"]
    end

    subgraph "Dịch vụ bên ngoài"
        F["API Qwen LLM"]
        G["Trang tuyển dụng<br/>TopCV, v.v."]
    end

    A --> B
    B --> C
    B --> D
    B --> E
    C --> E
    C --> F
    D --> G

```
