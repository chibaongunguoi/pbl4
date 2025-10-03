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
        "/api/crawl",
        {
            "urls": urls,
            "callback_url": "http://localhost:37555/api/receive",
            "metadata": {
                "start_at": time.time(),
            },
        },
    )


urls = [
    "https://devwork.vn/viec-lam/13573/flutter-developer-(tieng-nhat-n1~n4)",
    "https://devwork.vn/viec-lam/11373/junior-brsepm_n2",
    "https://devwork.vn/viec-lam/4155/pmbrse",
    "https://devwork.vn/viec-lam/12760/middle-se-java_n3-tieng-nhat",
    "https://devwork.vn/viec-lam/12609/brse-(c-flutter...)_n2-tieng-nhat",
    "https://devwork.vn/viec-lam/12096/brse-ky-su-cau-noi-n2-tieng-nhat",
    "https://devwork.vn/viec-lam/13532/senior-cc++-developer",
    "https://devwork.vn/viec-lam/13579/python-onsite-tokyo",
    "https://devwork.vn/viec-lam/13560/se-c-n2-remote",
    "https://devwork.vn/viec-lam/13464/senior-fullstack-developer-java",
    "https://devwork.vn/viec-lam/13008/brse-ky-su-cau-noi",
    "https://devwork.vn/viec-lam/3795/brse-(ha-noi)",
    "https://devwork.vn/viec-lam/3771/brse-(da-nang)",
    "https://devwork.vn/viec-lam/12761/senior-se_n2-tieng-nhat",
    "https://devwork.vn/viec-lam/12759/junior-se-java_n3-tieng-nhat",
    "https://devwork.vn/viec-lam/13529/android-developer",
    "https://devwork.vn/viec-lam/13016/mobile-kotlin",
    "https://devwork.vn/viec-lam/13017/ios-developer",
    "https://devwork.vn/viec-lam/13581/dev-(odoo)",
    "https://devwork.vn/viec-lam/13556/harmonyos-developer",
    "https://devwork.vn/viec-lam/13523/qc-onsite-cat-linh",
    "https://devwork.vn/viec-lam/13263/reactjs-onsite-nguyen-tuan",
    "https://devwork.vn/viec-lam/13053/qc-onsite-hoan-kiem",
    "https://devwork.vn/viec-lam/13501/java-onsite-dong-da",
    "https://devwork.vn/viec-lam/13493/it-adminit-engineer-onsite-quan-3",
    "https://devwork.vn/viec-lam/13139/brse-remote-20h-24h",
    "https://devwork.vn/viec-lam/13403/fullstack-java-onsite-cau-giay",
    "https://devwork.vn/viec-lam/13396/se-remote",
    "https://devwork.vn/viec-lam/12848/dw-brse-remote-100percent",
    "https://devwork.vn/viec-lam/12963/remote-datageeks-data-scraping-expert-fps",
    "https://devwork.vn/viec-lam/13311/telesale",
    "https://devwork.vn/viec-lam/13386/nhan-vien-kinh-doanh",
    "https://devwork.vn/viec-lam/13350/business-development-korean",
    "https://devwork.vn/viec-lam/12661/business-development",
    "https://devwork.vn/viec-lam/13205/android",
    "https://devwork.vn/viec-lam/13191/it-(brse)",
    "https://devwork.vn/viec-lam/13188/branch-manager-(korea)",
    "https://devwork.vn/viec-lam/13189/cc++",
    "https://devwork.vn/viec-lam/13212/vue.js-php",
    "https://devwork.vn/viec-lam/13204/(java-technical-lead)",
    "https://devwork.vn/viec-lam/13578/ba-onsite-quan-1-hcm",
    "https://devwork.vn/viec-lam/13577/senior-qa-onsite-duong-dinh-nghe",
    "https://devwork.vn/viec-lam/13576/lap-trinh-mobile-flutter-(dart)-onsite-ba-trieu",
    "https://devwork.vn/viec-lam/13548/qc-onsite-dien-bien-phu",
    "https://devwork.vn/viec-lam/13574/senior-react-native-onsite-duong-dinh-nghe",
    "https://devwork.vn/viec-lam/13572/be-java-onsite-quan-1",
    "https://devwork.vn/viec-lam/13568/data-engineer-(ses)_remotequan-1",
    "https://devwork.vn/viec-lam/13104/ruby-remote",
    "https://devwork.vn/viec-lam/13570/ba-onsite-cau-giay",
    "https://devwork.vn/viec-lam/13567/qc-onsite-quan-1",
    "https://devwork.vn/viec-lam/12962/site-reliability-engineering-(sre)-remote",
    "https://devwork.vn/viec-lam/13541/android-developer-onsite-pham-van-bach",
    "https://devwork.vn/viec-lam/12713/junior-java-developer",
    "https://devwork.vn/viec-lam/11382/junior-php-developer",
    "https://devwork.vn/viec-lam/13563/reactjs-onsite-duy-tan",
    "https://devwork.vn/viec-lam/13562/php-onsite-duy-tan",
    "https://devwork.vn/viec-lam/13561/qa-onsite-lang-ha",
    "https://devwork.vn/viec-lam/13367/reactjs-onsite-lang-ha",
    "https://devwork.vn/viec-lam/13351/java-senior-onsite-lang-ha",
    "https://devwork.vn/viec-lam/13559/outsystem-remote",
]


async def main():
    mid = len(urls) // 2
    urls_1 = urls[mid:]
    urls_2 = urls[:mid]
    await asyncio.gather(
        getResponse(urls_1),
        getResponse(urls_2),
    )


if __name__ == "__main__":
    asyncio.run(main())
