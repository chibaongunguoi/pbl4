from selenium.webdriver import Chrome
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import re
from dataclasses import dataclass
from datetime import datetime, timezone
import random


def now():
    return datetime.now(timezone.utc).isoformat()


def newDriver():
    options = Options()
    options.add_argument("--no-sandbox")
    # options.add_argument('--headless')
    options.add_argument("--disable-extensions")
    options.add_argument("start-maximized")
    options.add_argument("disable-infobars")
    options.add_argument("--disable-dev-shm-usage")
    print("[One-INFO] Creating a new Chrome driver...")
    driver = Chrome(options=options)
    print("[One-SUCCESS] New Chrome driver created successfully.")
    return driver


def accessUrl(driver: Chrome, url: str, access_cooldown: int) -> BeautifulSoup:
    print(f"[One-INFO] Accessing URL {url}...")
    start_time = time.time()
    driver.get(url)
    end_time = time.time()
    print(f"[One-INFO] Accessing the URL takes {end_time - start_time:.4f} seconds.")
    time.sleep(access_cooldown + 2 * random.random())
    page = BeautifulSoup(driver.page_source, "html.parser")
    return page


def removeConsecutiveSpaces(s: str):
    lines = [line.strip() for line in s.split("\n") if line.strip() != ""]
    s = "\n".join(lines)

    old_char = ""
    result = ""
    for c in s:
        if old_char != " " or c != " ":
            result += c

        old_char = c

    return result


@dataclass
class DevWorkCrawlOptions:
    access_cooldown: int = 2


class OneHtmlScraper:
    def __init__(
        self, tag: str, attrs: dict, target_attr: str | None, transform_fn=None
    ):
        self.tag = tag
        self.attrs = attrs
        self.target_attr = target_attr
        self.transform_fn = transform_fn

    def getTextFromTag(self, tag):
        result = (
            tag.get_text() if self.target_attr is None else tag.get(self.target_attr)
        )
        result = removeConsecutiveSpaces(result)
        if self.transform_fn is not None:
            result = self.transform_fn(result)

        return result

    def firstResult(self, page: BeautifulSoup):
        result: str | None = None
        for tag in page.find_all(self.tag, attrs=self.attrs):
            result = self.getTextFromTag(tag)

        return result

    def allResults(self, page: BeautifulSoup):
        results = []
        for tag in page.find_all(self.tag, attrs=self.attrs):
            result = self.getTextFromTag(tag)
            results.append(result)

        return results


class DevWorkJobUrlsCrawler:
    def __init__(self, options: DevWorkCrawlOptions):
        self.options = options

    def crawlAllJobLinksAtUrl(self, driver: Chrome, url: str):
        print(f"[One-INFO] Getting urls from {url}")
        page = accessUrl(
            driver=driver, url=url, access_cooldown=self.options.access_cooldown
        )
        scraper = OneHtmlScraper(
            tag="a",
            attrs={
                "data-v-289040a2": "",
                "class": "",
                "target": "_blank",
                "href": re.compile(r"^/viec-lam/\d+"),
            },
            target_attr="href",
            transform_fn=lambda url: f"https://devwork.vn{url}",
        )
        job_urls = scraper.allResults(page)
        print(f"[One-SUCCESS] Got {len(job_urls)} urls.")
        return job_urls

    def crawlAllJobLinks(self, pages: list[int]):
        print("[One-INFO] Start crawling all jobs.")
        results = []
        try:
            with newDriver() as driver:
                for page_idx in pages:
                    try:
                        url = f"https://devwork.vn/viec-lam?page={page_idx}"
                        result = self.crawlAllJobLinksAtUrl(driver=driver, url=url)
                        results.extend(result)

                    except Exception as e:
                        print(f"[One-ERROR] {e}")

        except Exception as e:
            print(f"[One-ERROR] {e}")

        print("[One-INFO] Done.")

        return results


class JobDetail:
    def __init__(
        self,
        url=None,
        thumbnail=None,
        job_title=None,
        company_url=None,
        company_name=None,
        province=None,
        salary=None,
        skills=None,
        descriptions=None,
        job_info=None,
    ):
        self.url = url
        self.thumbnail = thumbnail
        self.job_title = job_title
        self.company_url = company_url
        self.company_name = company_name

        self.province = province
        self.salary = salary
        self.skills = skills
        self.descriptions = descriptions
        self.job_info = job_info

        self.collected_at = now()


@dataclass
class DevWorkScrapeOptions:
    access_cooldown: int = 2


class DevWorkScraper:
    def __init__(self, options: DevWorkScrapeOptions):
        self.options = options
        self.url_prefix = "https://devwork.com"

    def getDescriptions(self, page):
        try:
            mainElement = page.find("div", attrs={"class": "background-content-job"})
            titleElements = (
                mainElement.find_all("h2", attrs={"class": "block-title"})
                if mainElement is not None
                else []
            )
            descriptionElements = (
                mainElement.find_all("div", attrs={"class": "block-desc"})
                if mainElement is not None
                else []
            )

            tagsElement = (
                mainElement.find("div", attrs={"class": "tags"})
                if mainElement is not None
                else None
            )
            skillElements = (
                tagsElement.find_all(
                    "a", attrs={"href": re.compile("^/viec-lam/"), "class": ""}
                )
                if tagsElement is not None
                else []
            )

            skills = (element.get_text() for element in skillElements)
            titles = (
                removeConsecutiveSpaces(element.get_text())
                for element in titleElements[1:]
            )
            descriptions = [
                removeConsecutiveSpaces(element.get_text())
                for element in descriptionElements
            ]

            return tuple(skills), {
                title: description for title, description in zip(titles, descriptions)
            }

        except Exception as e:
            print("[One-ERROR] Error occured at getDescriptions:", e)

        return {}

    def getJobInfo(self, page):
        infoElements = page.find_all("div", attrs={"class": "location-profile-job"})
        result = {}
        for element in infoElements:
            title, desc = element.strong.get_text(), element.span.get_text()
            title = removeConsecutiveSpaces(title)
            desc = removeConsecutiveSpaces(desc)
            result[title] = desc

        return result

    def getSalary(self, page):
        salary = None
        for div in page.find_all("div", attrs={"class": "mt-12"}):
            if (
                not div.find("div", attrs={"class": "salary-amount"}, recursive=False)
                is not None
            ):
                continue

            salary_amount = removeConsecutiveSpaces(div.div.get_text())
            salary = salary_amount

        return salary

    def getProvince(self, page):
        province = None
        for p in page.find_all("p"):
            if p.find("i") is not None:
                province = p.get_text()
                province = removeConsecutiveSpaces(province)
                break

        return province

    def getCompany(self, headerDetails):
        company_name = None
        company_url = None

        def result():
            return company_name, company_url

        company_title_element = headerDetails.find(
            "h5", attrs={"class": re.compile(r"mb\-10 fw\-400")}
        )
        if company_title_element is None:
            print("[One-WARN] company_title_element is None")
            return result()

        a = company_title_element.find("a")
        if a is not None:
            company_url = self.url_prefix + a.get("href")
            company_name = a.get_text()
            company_name = removeConsecutiveSpaces(company_name)

        else:
            print("[One-WARN] is None")

        return result()

    def getThumbnail(self, page):
        thumbnail = None
        headerImage = page.find("div", attrs={"class": re.compile(r"header-image")})
        if headerImage is not None:
            thumbnail = headerImage.find("img").get("src")

        return thumbnail

    def getJobTitle(self, page):
        title = page.find("h1", attrs={"class": "mb-3"}).get_text()
        return removeConsecutiveSpaces(title)

    def scrapeAtUrl(self, driver: Chrome, url: str):
        thumbnail = None

        page = accessUrl(
            driver=driver, url=url, access_cooldown=self.options.access_cooldown
        )

        if page is None:
            raise Exception("Failed to access the page.")

        headerDetails = page.find("div", attrs={"class": "header-details"})
        if headerDetails is None:
            raise Exception("Failed to scrape the page.")

        company_name, company_url = self.getCompany(page)
        if company_url is None:
            raise Exception("Cannot get the company's information.")

        thumbnail = self.getThumbnail(page)

        province = self.getProvince(headerDetails)
        salary = self.getSalary(page)
        job_info = self.getJobInfo(page)
        skills, descriptions = self.getDescriptions(page)
        title = self.getJobTitle(headerDetails)

        job = JobDetail(
            url=url,
            thumbnail=thumbnail,
            job_title=title,
            province=province,
            skills=skills,
            descriptions=descriptions,
            job_info=job_info,
            company_name=company_name,
            company_url=company_url,
            salary=salary,
        )
        return job

    def scrape(self, job_urls: list[str]):
        results = []
        total = len(job_urls)
        try:
            with newDriver() as driver:
                for i, url in enumerate(job_urls):
                    try:
                        print(f"Progress {i} / {total}")
                        result = self.scrapeAtUrl(driver, url)
                        results.append(result)
                        print("[One-SUCCESS] Scraped the page successfully.")
                    except Exception as e:
                        print(f"[One-ERROR] {e}")

        except Exception as e:
            print(f"[One-ERROR] {e}")

        print(f"Progress {total} / {total}")
        print("[One-INFO] Done.")
        return results
