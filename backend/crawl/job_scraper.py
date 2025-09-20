from requests import Response
from datetime import datetime, timezone
import re
from src.scraper_api_host import ScraperApiHost


def now():
    return datetime.now(timezone.utc).isoformat()


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


def getDescriptions(page):
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
            removeConsecutiveSpaces(element.get_text()) for element in titleElements[1:]
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


def getJobInfo(page):
    infoElements = page.find_all("div", attrs={"class": "location-profile-job"})
    result = {}
    for element in infoElements:
        title, desc = element.strong.get_text(), element.span.get_text()
        title = removeConsecutiveSpaces(title)
        desc = removeConsecutiveSpaces(desc)
        result[title] = desc

    return result


def getSalary(page):
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


def getProvince(page):
    province = None
    for p in page.find_all("p"):
        if p.find("i") is not None:
            province = p.get_text()
            province = removeConsecutiveSpaces(province)
            break

    return province


def getCompany(headerDetails):
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


def getThumbnail(page):
    thumbnail = None
    headerImage = page.find("div", attrs={"class": re.compile(r"header-image")})
    if headerImage is not None:
        thumbnail = headerImage.find("img").get("src")

    return thumbnail


def getJobTitle(page):
    title = page.find("h1", attrs={"class": "mb-3"}).get_text()
    return removeConsecutiveSpaces(title)


def scrapeAtUrl(response: Response):
    thumbnail = None

    from bs4 import BeautifulSoup

    page = BeautifulSoup(response.content, "html.parser")
    url = response.url

    headerDetails = page.find("div", attrs={"class": "header-details"})
    if headerDetails is None:
        raise Exception("Failed to scrape the page.")

    company_name, company_url = getCompany(page)
    if company_url is None:
        raise Exception("Cannot get the company's information.")

    thumbnail = getThumbnail(page)

    province = getProvince(headerDetails)
    salary = getSalary(page)
    job_info = getJobInfo(page)
    skills, descriptions = getDescriptions(page)
    title = getJobTitle(headerDetails)

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


if __name__ == "__main__":
    api_host = ScraperApiHost(
        host="localhost", port=37222, content_function=scrapeAtUrl
    )
    api_host.run()
