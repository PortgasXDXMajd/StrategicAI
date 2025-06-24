from pydantic import BaseModel
import requests
from enum import Enum
from bs4 import BeautifulSoup
from typing import Dict, List, Union


class ScrapingReturnType(Enum):
    HTML = 1
    TEXT = 2


class ScrapResult(BaseModel):
    scraped_results: Dict[str, Union[str, Dict[str, str]]] = dict()


class WebScraper:

    def scrape(
        self,
        urls: Union[str, List[str]],
        tag_names: List[str] = ["h1", "h2", "h3", "h4", "p","span","a"],
        return_type: ScrapingReturnType = ScrapingReturnType.TEXT,
    ) -> ScrapResult:

        res = {}
        for url in urls:
            if "wikipedia" in url.lower():
                res.update(self.scrape_wikipedia(url, return_type))
            else:
                res.update(self.scrape_general(url, tag_names, return_type))

        return res

    def scrape_general(
        self,
        urls: Union[str, List[str]],
        tag_names: List[str] = ["h1", "h2", "h3", "h4", "p", "span", "a"],
        return_type: ScrapingReturnType = ScrapingReturnType.TEXT,
    ) -> ScrapResult:

        if isinstance(urls, str):
            urls = [urls]

        result = {}

        for url in urls:
            try:
                response = requests.get(url)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, "html.parser")
                else:
                    continue

                elements = []
                for tag in soup.find_all(True):
                    if tag.name in tag_names:
                        elements.append(tag)

                if return_type == ScrapingReturnType.HTML:
                    result[url] = " ".join(
                        [f"<{el.name}>{el.get_text()}</{el.name}>" for el in elements])

                elif return_type == ScrapingReturnType.TEXT:
                    result[url] = " ".join([el.get_text() for el in elements])

                else:
                    result[url] = None

            except Exception as e:
                result[url] = f"An error occurred: {e}"

        return ScrapResult(scraped_results=result)

    def scrape_wikipedia(
        self, urls: Union[str, List[str]], return_type: ScrapingReturnType = ScrapingReturnType.TEXT
    ) -> ScrapResult:

        if isinstance(urls, str):
            urls = [urls]

        result = {}

        for url in urls:
            try:
                response = requests.get(url)

                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, "html.parser")
                else:
                    continue

                page_content_text = []
                page_content_html = []

                title_tag = soup.find("h1")
                if title_tag:
                    page_content_text.append(f"Title: {title_tag.get_text()}")
                    page_content_html.append(
                        f"<h1>{title_tag.get_text()}</h1>")

                infobox = soup.find("table", {"class": "infobox"})
                if infobox:
                    if return_type == ScrapingReturnType.HTML:
                        page_content_html.append(str(infobox))
                    if return_type == ScrapingReturnType.TEXT or return_type == ScrapingReturnType.HTML:
                        page_content_text.append(
                            infobox.get_text(separator=" "))

                first_paragraphs = soup.find_all("p", limit=3)
                for paragraph in first_paragraphs:
                    if return_type == ScrapingReturnType.HTML:
                        page_content_html.append(str(paragraph))
                    if return_type == ScrapingReturnType.TEXT or return_type == ScrapingReturnType.HTML:
                        page_content_text.append(
                            paragraph.get_text(separator=" "))

                sections = soup.find_all(["h2", "h3"])
                for section in sections:
                    heading_text = section.get_text(separator=" ")
                    if return_type == ScrapingReturnType.HTML:
                        page_content_html.append(
                            f"<{section.name}>{heading_text}</{section.name}>")
                    if return_type == ScrapingReturnType.TEXT or return_type == ScrapingReturnType.HTML:
                        page_content_text.append(heading_text)

                if return_type == ScrapingReturnType.TEXT:
                    result[url] = "\n".join(page_content_text)
                elif return_type == ScrapingReturnType.HTML:
                    result[url] = "\n".join(page_content_html)

            except Exception as e:
                result[url] = f"An error occurred: {e}"

        return ScrapResult(scraped_results=result)
