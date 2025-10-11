from datetime import datetime, timezone
from requests import Response
import re
from bs4 import BeautifulSoup
from typing import Any


def now():
    return datetime.now(timezone.utc).isoformat()


def removeConsecutiveSpaces(s: str) -> str:
    lines = [line.strip() for line in s.split("\n") if line.strip() != ""]
    s = "\n".join(lines)

    old_char = ""
    result = ""
    for c in s:
        if old_char != " " or c != " ":
            result += c

        old_char = c

    return result


class JobDetail:
    def __init__(
        self,
        url: str,
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


class ScrapeStrategy:
    def scrape(self, response: Response):
        response = response
        raise NotImplementedError()


class DevworkScrapeStrategy(ScrapeStrategy):
    def scrape(self, response: Response):
        thumbnail = None

        page = BeautifulSoup(response.content, "html.parser")
        url = response.url

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
        return job.__dict__

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
            company_url = "https://devwork.com" + a.get("href")
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


class TopCvScrapeStrategy(ScrapeStrategy):
    def getThumbnail(self, page) -> str | None:
        thumbnail = None
        try:
            a = page.find("a", attrs={"class": "company-logo"})
            thumbnail = a.find("img").get("src")
            thumbnail = removeConsecutiveSpaces(thumbnail)
        except Exception:
            pass
        return thumbnail

    def scrapeTitle(self, page) -> str:
        title = page.find("h1", attrs={"class": "job-detail__info--title"})
        if title is None:
            raise Exception("Cannot find title.")

        title = title.text
        title = removeConsecutiveSpaces(title)
        return title

    def scrapeCompanyInfo(self, page) -> dict:
        result: dict = {"company_name": None, "company_url": None}
        company_name_element = page.find(
            "a",
            attrs={
                "class": "name",
                "href": re.compile(r"^https://www.topcv.vn/cong-ty/"),
            },
        )

        result["company_name"] = removeConsecutiveSpaces(company_name_element.text)
        result["company_url"] = company_name_element.get("href")
        return result

    def scrapeUpperPart(self, page) -> dict:
        result = {"salary": None, "province": None}
        for item in page.find_all("div", attrs={"class": "job-detail__info--section"}):
            title = item.find(
                "div", attrs={"class": "job-detail__info--section-content-title"}
            )
            value = item.find(
                "div", attrs={"class": "job-detail__info--section-content-value"}
            )

            if title is None or value is None:
                continue

            if title.text == "Địa điểm":
                result["province"] = value.text
            elif title.text == "Mức lương":
                result["salary"] = value.text

        return result

    def scrapeBody(self, page) -> dict:
        result = {"descriptions": {}}

        for description_item in page.find_all(
            "div", attrs={"class": "job-description__item"}
        ):
            title = description_item.find("h3")
            content = description_item.find(
                "div", attrs={"class": "job-description__item--content"}
            )

            if content is None or title is None:
                continue

            result["descriptions"][title.text] = removeConsecutiveSpaces(content.text)

        return result

    def scrapeGeneralInfo(self, page) -> dict:
        result = {"job_info": {}}
        for item in page.find_all("div", attrs={"class": "box-general-group-info"}):
            title = item.find("div", attrs={"class": "box-general-group-info-title"})
            value = item.find("div", attrs={"class": "box-general-group-info-value"})

            if title is None or value is None:
                continue

            result["job_info"][title.text] = value.text

        return result

    def scrapeBoxCategory(self, page):
        result = {"skills": ()}
        skills = []
        for item in page.find_all("div", attrs={"class": "box-category collapsed"}):
            title = item.find("div", attrs={"class": "box-title"})
            values = item.find_all("div", attrs={"class": "box-category-tag"})

            if title is None or not values:
                continue

            if title.text == "Kỹ năng cần có":
                for value in values:
                    skills.append(value.text)

        result["skills"] = tuple(skills)
        return result

    def scrape(self, response: Response):
        url = response.url
        page = BeautifulSoup(response.content, "html.parser")

        descriptions = {}

        thumbnail = self.getThumbnail(page)
        upper_part_info = self.scrapeUpperPart(page)

        province = upper_part_info["province"]
        salary = upper_part_info["salary"]
        body_info = self.scrapeBody(page)
        descriptions.update(body_info["descriptions"])
        general_info = self.scrapeGeneralInfo(page)
        job_info = general_info["job_info"]
        box_category_info = self.scrapeBoxCategory(page)
        skills = box_category_info["skills"]
        title = self.scrapeTitle(page)
        company_info = self.scrapeCompanyInfo(page)
        company_name = company_info["company_name"]
        company_url = company_info["company_url"]
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
        return job.__dict__


class OverallScrapeStrategy(ScrapeStrategy):
    def __init__(self):
        self.sub_strategies: dict[str, ScrapeStrategy] = {
            r"^https://devwork\.vn/": DevworkScrapeStrategy(),
            r"^https://www\.topcv\.vn/": TopCvScrapeStrategy(),
        }

    def scrape(self, response: Response):
        url = response.url
        for platform, sub_strategy in self.sub_strategies.items():
            if re.match(platform, url):
                return sub_strategy.scrape(response)


class DevworkCrawlStrategy(ScrapeStrategy):
    def scrape(self, response: Response):
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(response.content, "html.parser")

        container: Any = soup.find("div", attrs={"class": "listing-container"})
        if container is None:
            return []

        job_urls = []
        results = container.find_all(
            "a", attrs={"href": re.compile(r"^/viec-lam/\d+/.+")}
        )
        for elm in results:
            elm: Any
            job_urls.append("https://devwork.vn" + elm.get("href"))

        return job_urls


class TopCvCrawlStrategy(ScrapeStrategy):
    def scrape(self, response: Response):
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(response.content, "html.parser")

        job_urls = []
        container: Any = soup.find("div", attrs={"class": "job-list-search-result"})
        if container is None:
            return job_urls

        results = container.find_all(
            "a", attrs={"href": re.compile(r"^https://www\.topcv\.vn/viec-lam/.+")}
        )

        for elm in results:
            elm: Any
            job_urls.append(elm.get("href"))

        return job_urls


class OverallCrawlStrategy(ScrapeStrategy):
    def __init__(self):
        self.sub_strategies: dict[str, ScrapeStrategy] = {
            r"^https://devwork\.vn/": DevworkCrawlStrategy(),
            r"^https://www\.topcv\.vn/": TopCvCrawlStrategy(),
        }

    def scrape(self, response: Response):
        url = response.url
        for platform, sub_strategy in self.sub_strategies.items():
            if re.match(platform, url):
                return sub_strategy.scrape(response)
