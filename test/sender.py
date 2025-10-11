import time
import requests
import asyncio


class RequestSender:
    def __init__(self, host: str, port: int | None = None) -> None:
        self.host = host
        if host == "localhost":
            self.host = "http://localhost"
        if port is not None:
            self.host += f":{port}"

    def post(self, url, data):
        url = self.host + url
        response = requests.post(url, json=data)
        data = response.json()
        return data


async def getResponse(urls):
    request_sender = RequestSender(host="localhost", port=37222)
    await asyncio.to_thread(
        request_sender.post,
        "/api/scrape",
        {
            "urls": urls,
            "callback_url": "http://localhost:37555/api/receive",
            "metadata": {
                "start_at": time.time(),
            },
        },
    )


urls = [
    "https://devwork.vn/viec-lam/13582/fullstack-dev",
    "https://www.topcv.vn/viec-lam/junior-fullstack-developers-fintech-ecommerce/1487371.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    "https://devwork.vn/viec-lam/13181/business-developmentsales-jp",
    "https://www.topcv.vn/viec-lam/senior-it-project-manager-japanese-projects-thu-nhap-upto-3000-usd-di-lam-ngay-ha-noi/1894284.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    "https://devwork.vn/viec-lam/13040/ky-su-cau-noi-brse-n2-tieng-nhat",
    "https://www.topcv.vn/viec-lam/full-stack-developer-java-springboot-react/1783213.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    "https://devwork.vn/viec-lam/13022/senior-engineer-technical-leader-n2-tieng-nhat-luong-upto-dollar3000",
    "https://www.topcv.vn/viec-lam/junior-business-analyst-at-bitel-based-in-peru-salary-1-100-1-400/1894336.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    "https://devwork.vn/viec-lam/12805/brse-lam-viec-tai-tokyo",
    "https://www.topcv.vn/viec-lam/java-backend-leader/1718449.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    "https://devwork.vn/viec-lam/11963/pm-remote",
    "https://www.topcv.vn/viec-lam/senior-backend-developer-golang-prefer/1883361.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://devwork.vn/viec-lam/12483/tech-leader-(tieng-nhat-n1n2)",
    # "https://devwork.vn/viec-lam/11115/junior-android-developer_-thu-viec-100percent-luong",
    # "https://devwork.vn/viec-lam/11286/midsenior-mobile-(-android)_thu-viec-100percent-luong-n1-n4",
    # "https://devwork.vn/viec-lam/13080/tuyen-dung-ky-su-co-so-ha-tang",
    # "https://devwork.vn/viec-lam/13079/tuyen-dung-thuc-tap-sinh-ky-su-cntt",
    # "https://devwork.vn/viec-lam/12374/brse-kiem-project-manager",
    # "https://devwork.vn/viec-lam/13474/sebrse",
    # "https://devwork.vn/viec-lam/13331/web-app-(ngon-ngu-bat-ky)-n2",
    # "https://devwork.vn/viec-lam/13136/engineering-consultant",
    # "https://devwork.vn/viec-lam/13480/backend-engineer-(medusajs-postgresql-azure)-remote",
    # "https://devwork.vn/viec-lam/13094/ky-su-phat-trien-web",
    # "https://devwork.vn/viec-lam/12206/hybrid-senior-engineer-nodejs-typescript-n3-tieng-nhat-ha-noida-nang",
    # "https://devwork.vn/viec-lam/11285/mid-reactjs-_thu-viec-100percent-luong",
    # "https://devwork.vn/viec-lam/12292/software-engineer_php_n3-tieng-nhat-salary-up-to-dollar2500"
    # "https://www.topcv.vn/viec-lam/nhan-vien-kinh-doanh-tu-van-phan-mem-thu-nhap-tu-10-15-trieu/1892221.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-kinh-doanh-thi-truong-direct-sales-thu-nhap-tu-10-15-trieu/1892230.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-ky-thuat-in-an-thu-nhap-den-17-trieu-tai-duc-hoa/1895830.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/lap-trinh-vien-fullstack-tu-3-nam-kinh-nghiem-thu-nhap-700-1500-usd/1886652.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/truong-pho-phong-rd/1896253.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/thiet-ke-do-hoa-graphic-designer-uu-tien-nu-1-nam-kinh-nghiem-nghi-thu-7-cn-thu-nhap-upto-20m-tai-ha-noi/1899574.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/middle-fullstack-java-3-nam-kinh-nghiem-luong-35m/1885162.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/manual-tester-qa-qc-du-an-banking-luong-up-to-30m/1885140.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/game-client-developer/1885078.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-front-end-developer-chi-tuyen-nu/1890433.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/chuyen-vien-ky-thuat-tu-van-giai-phap-presales-presales-engineer/1897397.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/3d-rigging-artist-luong-25tr-45tr-tai-ho-chi-minh-yeu-cau-bat-buoc-nop-portfolio/1736983.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/angular-developer/1900040.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/ky-su-phan-mem-nhung-senior/1884101.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/java-spring-boot/1861350.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/ai-engineer/1898979.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-thiet-ke-nhan-viec-ngay/1508460.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/fullstack-developer-nodejs-reactjs-vue-js-experience-above-04-years/1881978.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/senior-full-stack-developer/1897298.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/net-developer-tu-2-7-nam-kinh-nghiem/1894111.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-kinh-doanh-phan-mem-ai-sales-b2b-thu-nhap-15-30-trieu-nghi-t7-va-cn-ha-noi/1891017.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/frontend-developer-thu-nhap-gross-upto-32-trieu-ho-tro-an-trua-tai-ha-noi/1885683.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/software-developer-c-golang/1637012.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/java-developer/744031.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/thuc-tap-sinh-kinh-doanh-thu-nhap-hap-dan/1889055.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/software-engineer-java/1889691.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/android-automotive-developer-middle-to-senior/1888745.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/engineering-manager-net-hands-on/1889717.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/senior-middle-hybrid-app-developer-angular-capacitor-lam-viec-remote/1888432.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/3d-artist-luong-den-17-trieu-ha-noi/1894340.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/senior-ai-engineer-cho-du-an-fintech/1876748.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/senior-ui-ux-designer-blockchain/1852014.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-idea-creator-nganh-print-on-demand/1779206.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/product-designer-up-to-30-months-salary/1828997.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/it-comtor-tieng-nhat-n2-tro-len-nghi-t7-cn/1889547.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-thiet-ke-bao-bi-in-an-graphic-designer-01-nam-kinh-nghiem-di-lam-ngay-tai-hoang-mai-hn/1883318.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-kinh-doanh-sale-phan-mem-thu-nhap-10-15-trieu-khu-vuc-ha-noi/1880209.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-junior-designer-ui-ux-luong-12-18tr-tai-da-nang-khong-yeu-cau-kinh-nghiem/1889578.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-nhap-lieu-biet-tieng-nhat-yeu-cau-cv-tieng-nhat/1860069.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/nhan-vien-ky-thuat/1899212.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
    # "https://www.topcv.vn/viec-lam/chuyen-vien-thiet-ke-ui-ux-tu-03-nam-kinh-nghiem-thu-nhap-hap-dan-lam-viec-tai-ha-noi/1890837.html?ta_source=JobSearchList_LinkDetail&u_sr_id=cTdCNlJx59TDb1s8uP2w765V0MfVL2WCQJGhXrs9_1759544348",
]


async def main():
    urls_1 = urls[:4]
    urls_2 = urls[4:8]
    urls_3 = urls[8:12]
    await asyncio.gather(
        getResponse(urls_1),
        getResponse(urls_2),
        getResponse(urls_3),
    )


if __name__ == "__main__":
    asyncio.run(main())
