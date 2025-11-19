import JobDetail from "@/models/JobDetail.js";
import User from "@/models/User.js";

const job_detail_data = [
  {
    url: "https://devwork.vn/viec-lam/13181/business-developmentsales-jp",
    thumbnail: "https://static.devworks.jp/images/company/dIJXXzqsF8wfObvk9ehsTdYQ10Z2mKUcKWsp67xm.jpg",
    job_title: "Business Development/Sales JP",
    company_url: "https://devwork.com/cong-ty/14492/cong-ty-co-phan-cong-nghe-va-dich-vu-codluck",
    company_name: "CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ DỊCH VỤ CODLUCK",
    province: "Hà Nội",
    salary: "15-25 triệu",
    skills: [
      "Sale Excutive"
    ],
    descriptions: {
      "Mô tả công việc": "* Tìm kiếm, gửi email cho khách hàng để giới thiệu về doanh nghiệp cũng như các sản phẩm/dịch vụ mà công ty cung cấp.\n* Hiểu rõ nhu cầu của khách hàng thông qua các phương thức liên hệ gián tiếp, sau đó chọn lọc sản phẩm/dịch vụ phù hợp để giới thiệu.\n* Thiết lập, duy trì và phát triển mối quan hệ với khách hàng doanh nghiệp.\n* Chăm sóc và duy trì mối quan hệ với khách hàng nhằm gia tăng doanh số từ những khách hàng đã sử dụng sản phẩm/dịch vụ của công ty.",
      "Yêu cầu công việc": "* – Tổ chức được ít nhất 4 cuộc họp lần đầu trong 1 tháng (tương đương 4 khách hàng).\n– Tổ chức được ít nhất 2 cuộc họp lần 2 trong 1 tháng (tương đương 2 khách hàng).\n* Có từ 1 năm kinh nghiệm ở vị trí Business Development thị trường tiếng Nhật hoặc vị trí tương đương\n* Tiếng Nhật giao tiếp tốt\n* Tìm kiếm, liên hệ, hearing khách hàng để hiểu rõ nhu cầu cũng như giới thiệu, tư vấn được chính xác dịch vụ công ty sẽ cung cấp.\n* Sắp xếp và chủ động điều phối các cuộc họp lần đầu.\n* Sắp xếp cuộc họp lần 2 (có sự tham gia của Business Development Manager).",
      "Thời gian làm việc": "Trong tuần:\nTừ thứ 2 - thứ 6",
      "Quyền lợi ứng viên": "* Thưởng 500.000 VNĐ cho mỗi meeting, thưởng dự án lên tới 8% doanh thu.\n* Thu nhập hấp dẫn, thử việc 100% lương.\n* Cơ hội thăng tiến rõ ràng dựa theo năng lực.\n* Môi trường làm việc cực kỳ trẻ trung, năng động và sáng tạo.\n* 13 tháng lương/năm\n* Khám sức khoẻ định kỳ hằng năm\n* Đóng bảo hiểm đầy đủ\n* Nghỉ lễ, Tết theo quy định của nhà nước và thưởng theo quy định của công ty.\n* Các phúc lợi khác: team building hàng quý, happy hour/tuần, du lịch công ty…\n* Thời gian làm việc: 8:30 – 17:30 (từ thứ 2 đến thứ 6)",
      "Địa chỉ làm việc": "Địa chỉ: Tầng 16, HL Tower Building, 6/82 Duy Tân, Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
    },
    job_info: {
      "Kinh nghiệm": "1 năm",
      "Trình độ": "Đại học",
      "Vị trí": "Junior",
      "Hình thức": "Full-time",
      "Hạn nộp hồ sơ": "2025-12-31",
      "Số lượng": "1 người",
      "Phỏng vấn": "1 vòng"
    },
    collected_at: "2025-08-31T15:37:06.054561+00:00"
  },
  {
    url: "https://devwork.vn/viec-lam/13040/ky-su-cau-noi-brse-n2-tieng-nhat",
    thumbnail: "https://static.devworks.jp/images/company/v4Ydlgtq4yfLVv2oPKe8RtlsWWwMY4me4Qvv0uzj.png",
    job_title: "Kỹ sư cầu nối BrSE - N2 Tiếng Nhật",
    company_url: "https://devwork.com/cong-ty/349/zensho-ha-noi-system-center",
    company_name: "Zensho Hà Nội System Center",
    province: "Hà Nội",
    salary: "40-50 triệu",
    skills: [
      "Kotlin",
      "Swift",
      "Java",
      "C#",
      "Android",
      "Objective C",
      "Bridge Engineer"
    ],
    descriptions: {
      "Mô tả công việc": "•\tTrao đổi, giao tiếp trực tiếp với Khách hàng Nhật hàng ngày thông qua call, chat, tool quản lý task\n•\tTiếp nhận yêu cầu, cùng DEV phân tích yêu cầu, đưa ra solution xử lý và trao đổi với KH để chốt SPEC\n•\tPhân chia và quản lý task, tiến độ của các thành viên trong nhóm\n•\tSupport những Q&A hoặc request điều tra của khách hàng.",
      "Yêu cầu công việc": "Có từ 03 năm kinh nghiệm trở lên đảm nhận vai trò BridgeSE\nCó thể giao tiếp tự tin bằng tiếng Nhật, đạt chứng chỉ N2 trở lên.\nCó kinh nghiệm liên quan tới lập trình Web, App (Java, hoặc C#) hoặc Lowcode\nCó kinh nghiệm làm việc với database MySQL, PostgreSQL, Oracle.\nSử dụng thành thạo các tool liên quan như tool quản lý version (svn, github/gitlab…), tool quản lý ticket (backlog, redmine, jira..).\nNăng động, sáng tạo và ham học hỏi, đặc biệt ưu tiên ứng viên có tình thần trách nhiệm cao trong công việc.\nCó thể làm việc theo nhóm hoặc độc lập.\nƯu tiên ứng viên:\nĐã từng làm hoặc có kinh nghiệm trên các nền tảng lowcode như Intramart, ArielAirOne,… (hoặc các nền tảng lowcode khác).\nCó các chứng chỉ liên quan đến lowcode platform là một lợi thế rất lớn.\nĐã từng trực tiếp tham gia lập trình (ngôn ngữ bất kỳ), hoặc làm ĐNYC (SRS) trực tiếp với khách hàng 1 năm trở lên.\nCó kiến thức về kiến trúc hạ tầng, CI/CD, có kinh nghiệm làm việc với một trong các cloud GCP/AWS/Azure là lợi thế.\nĐã từng trực tiếp làm high level design, basic design, detailed design.\nCó chứng chỉ về quản lý như PMP, PSM, PMI-ACP\nCó thời gian onsite hoặc sinh sống tại Nhật từ 1 năm trở lên\nĐã từng làm BrSE hoặc PM cho dự án 05 người trở lên",
      "Thời gian làm việc": "Trong tuần:\nTừ thứ 2 - thứ 6\nTrong ngày: Từ\n07:30 giờ -\n16:30 giờ",
      "Quyền lợi ứng viên": "Được làm việc và đào tạo trong môi trường tiếng Nhật chuyên nghiệp\nMức lương: 40 – 55 triệu\nThử việc full lương\nThưởng Tháng lương thứ 13 (1 tháng lương)\nThưởng thành tích: tùy theo thành tích (trung bình từ 1 tháng lương/năm)\nTham gia bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp đầy đủ theo luật Việt Nam\nTeam building thường xuyên, du lịch định kỳ 1 lần/năm\nChăm sóc khám sức khỏe định kỳ hàng năm\nBảo hiểm sức khỏe cá nhân\nThời gian làm việc: 5 ngày/tuần (7h30-16h30)",
      "Địa chỉ làm việc": "Tầng 2, tòa CIC tower, số 2 ngõ 219 Trung Kính, Yên Hòa, Cầu Giấy, Hà Nội."
    },
    job_info: {
      "Kinh nghiệm": "3 năm",
      "Trình độ": "Đại học",
      "Vị trí": "Middle",
      "Hình thức": "Full-time",
      "Hạn nộp hồ sơ": "2025-12-31",
      "Số lượng": "1 người",
      "Phỏng vấn": "1 vòng"
    },
    collected_at: "2025-08-31T15:37:10.950068+00:00"
  },
  {
    url: "https://devwork.vn/viec-lam/13022/senior-engineer-technical-leader-n2-tieng-nhat-luong-upto-dollar3000",
    thumbnail: "https://static.devworks.jp/images/company/zDPNHpXMECvca2gN9WKugT36ISIWM2c3VzZ8YFFs.png",
    job_title: "Senior Engineer / Technical Leader - N2 Tiếng Nhật - Lương upto $3000",
    company_url: "https://devwork.com/cong-ty/328/gmo-z.com-viet-nam-lab-center",
    company_name: "GMO-Z.com Việt Nam Lab Center",
    province: "Hà Nội",
    salary: "50-70 triệu",
    skills: [
      "AWS",
      "Laravel",
      "PHP",
      "Yii2"
    ],
    descriptions: {
      "Mô tả công việc": "● Tham gia phát triển các dự án của tập đoàn GMO (https://www.gmo.jp/en/);\n● Tham gia phát triển các dự án của tập đoàn GMO;\n● Làm việc cùng với đội phát triển thuộc phòng R&D của tập đoàn;\n● Phối hợp với các thành viên trong team để thiết kế, triển khai, tối ưu; những chức năng của sản phẩm;\n● Có cơ hội sang Nhật training tại tập đoàn GMO Internet Group (Tokyo hoặc Osaka).",
      "Yêu cầu công việc": "● Có từ 3 năm kinh nghiệm lập trình PHP với FW: Yii2 / Laravel (hoặc tương tự)\nHoặc từ 5 năm kinh nghiệm dev nói chung, có AWS và sẵn sàng nghiên cứu học hỏi thêm về PHP\n● Có từ 5 năm kinh nghiệm với vai trò Leader\n● Có kinh nghiệm làm việc với AWS (IAM,VPC, Fargate, Cloudwatch, ELB,...)\n● Tiếng Nhật từ N2 hoặc level tương đương.\n● Có kinh nghiệm làm việc DB: Mysql, Oracle\n● Hiểu về CI/CD và từng làm việc với Docker / Linux / Nginx.\n● Có kinh nghiệm phân tích và thiết kế hệ thống\n● Có kinh nghiệm tối ưu hóa performance\n● Yêu thích tìm hiểu và ứng dụng công nghệ mới trong thực tế.\nĐiểm cộng:\n● Ưu tiên ứng viên có kinh nghiệm Technical Leader\n● Kinh nghiệm là việc với Redis, Memcached là điểm cộng\n● Hiểu về API và từng thiết kế xây dựng API\n● Có tìm hiểu và áp dụng AI, ChatGPT, Copilot trong cải tiến công việc",
      "Thời gian làm việc": "Trong tuần:\nTừ thứ 2 - thứ 6\nTrong ngày: Từ\n08:00 giờ -\n17:30 giờ",
      "Quyền lợi ứng viên": "Ngoài các chế độ theo pháp luật hiện hành công ty còn có:\n● Mức lương hấp dẫn, up to $3000;\n● Hình thức làm việc hybrid, 2 ngày WFH/ tuần;\n● Đóng bảo hiểm 100% lương;\n● Điều chỉnh lương 2 lần/năm và có thể được điều chỉnh đột xuất trước kỳ review khi có đóng góp được ghi nhận;\n● Từng nhân viên được tạo cơ hội học tập và phát triển bản thân một cách toàn diện thông qua các hoạt động của công ty như:\no Đài thọ 100% học phí các khóa học tiếng Nhật cũng như lệ phí thi JLPT;\no Tài trợ chi phí tham gia các sự kiện, khóa học công nghệ phục vụ công việc;\no Được tham gia lớp học giao tiếp tiếng Nhật 1-1 với kỹ sư người Nhật tại công ty;\no Được rèn luyện kỹ thuật và kỹ năng viết blog: https://blog.vietnamlab.vn/\no Được công ty hỗ trợ thời gian và kinh phí để nghiên cứu công nghệ hằng quý;\no Được tham gia vào các nhóm nâng cao kỹ thuật với các kỹ sư giỏi trong công ty.\n● Có cơ hội on-site sang Nhật làm việc trực tiếp cho tập đoàn GMO Internet Group để nâng cao kỹ năng;\n● Ngoài các phụ cấp on-site, team building, ăn trưa công ty đặc biệt còn có phụ cấp bỏ thuốc lá, đi làm bằng xe đạp, hỗ trợ thêm chi phí di chuyển nếu nhà xa,...\n● Tổ chức chương trình khám sức khỏe định kỳ hàng năm tại bệnh viện uy tín và bảo hiểm sức khỏe toàn diện GMO-Aon care (theo cấp);\n● Các hoạt động dã ngoại, du lịch cũng được diễn ra thường xuyên;\n● Làm việc từ 8:00 - 12:00 và 13:30 - 17:30, nghỉ Thứ 7 và Chủ Nhật.",
      "Địa chỉ làm việc": "Tầng 6 tòa nhà Ocean Park, 01 Đào Duy Anh, quận Đống Đa, Hà Nội."
    },
    job_info: {
      "Kinh nghiệm": "5 năm",
      "Trình độ": "Đại học",
      "Vị trí": "Technical Leader",
      "Hình thức": "Full-time",
      "Hạn nộp hồ sơ": "2026-12-31",
      "Số lượng": "1 người",
      "Phỏng vấn": "2 vòng"
    },
    collected_at: "2025-08-31T15:37:16.537726+00:00"
  },
  {
    url: "https://devwork.vn/viec-lam/12805/brse-lam-viec-tai-tokyo",
    thumbnail: "https://static.devworks.jp/images/company/gsvOVzHf8nVKwWNQONikliBz3KKT4LNP5IIRctvh.jpg",
    job_title: "Brse làm việc tại Tokyo",
    company_url: "https://devwork.com/cong-ty/4401/vhec",
    company_name: "VHEC",
    province: "Tokyo",
    salary: "60-80 triệu",
    skills: [
      "Bridge Engineer",
      "Java"
    ],
    descriptions: {
      "Mô tả công việc": "• Làm việc tại Tokyo cùng với đội Developer.\n• Lập trình bằng ngôn ngữ Java\n• Phân tích, thiết kế, lập trình và fix bug.\n• Trao đổi với khách hàng lấy thông tin dự án, tài liệu yêu cầu, xác nhận lại thông tin và báo cáo tiến độ dự án.\n• Thực hiện kiểm tra chất lượng sản phẩm đầu ra của dự án trước khi deliver cho khách hàng.\n• Giải quyết các vấn đề phát sinh trong dự án, và các vấn đề sau khi bàn giao.",
      "Yêu cầu công việc": "• Tiếng Nhật: trình độ tương đương N2 trở lên (tiếng nhật giao tiếp tốt)\n• Có từ 3 năm kinh nghiệm lập trình liên tục bằng một trong các ngôn ngữ Java.\n• Có từ 3 năm kinh nghiệm làm việc ở vị trí BrSE.\n• Có kinh nghiệm làm tài liệu thiết kế (DD, BD), tài liệu test.\n• Có kinh nghiệm Leader, có ý thức trách nhiệm cao.\n• Có khả năng đàm phán, thuyết phục, đề xuất ý kiến và giải pháp.\n• Tích cực, chủ động, yêu thích việc quản lý dự án và dám đương đầu với thách thức.",
      "Thời gian làm việc": "Trong tuần:\nTừ thứ 2 - thứ 6",
      "Quyền lợi ứng viên": "- Lương năm 400-800Man\n- 14 tháng/năm.\n- Trợ cấp đi lại thực tế, tối đa 2man/tháng.",
      "Địa chỉ làm việc": "Tokyo, Japan"
    },
    job_info: {
      "Kinh nghiệm": "3 năm",
      "Trình độ": "Đại học",
      "Vị trí": "Middle",
      "Hình thức": "Full-time",
      "Hạn nộp hồ sơ": "2025-06-30",
      "Số lượng": "1 người",
      "Phỏng vấn": "2 vòng"
    },
    collected_at: "2025-08-31T15:37:21.407364+00:00"
  },
]


const user_data = [
  {
    role: "admin",
    username: "admin",
    password: "admin"
  },
  {
    role: "user",
    username: "user0001",
    password: "user0001"
  },
  {
    role: "user",
    username: "user0002",
    password: "user0002"
  },
]

async function initDb() {
  console.log("Initializing the database...");
  try {
    const users = await User.findOne();
    if (users) {
      console.log("Database has been initialized before.");
      return;
    }

    await User.insertMany(user_data);
    console.log("Inserted Users");
    await JobDetail.insertMany(job_detail_data);
    console.log("Inserted JobDetails");
  } catch (err) {
    console.log(`Error in initializing the database: ${err}`);
  }

}

export default initDb
