import os
import requests
from typing import List, Tuple
from app.core.web_search.models import SearchResult


class GoogleSearchEngine:

    def __init__(self):
        self.BASE_URL = os.getenv("GOOGLE_SE_API_URL")
        self.API_KEY = os.getenv("GOOGLE_SE_API_KEY")
        self.CX = os.getenv("GOOGLE_SE_CX")

        if not self.API_KEY or not self.CX or not self.BASE_URL:
            raise Exception(
                "Google API key/url or CX not found in environment variables.")

    def _is_social_media_or_unwanted(self, url: str) -> bool:
        unwanted_keywords = [
            "linkedin.com",
            "instagram.com",
            "facebook.com",
            "twitter.com",
            "privacy",
            "terms",
            "conditions",
        ]

        return any(keyword in url for keyword in unwanted_keywords)

    def _extract_urls_and_previews(self, search_results) -> List[Tuple[str, str]]:
        if "items" not in search_results:
            return []

        results = []
        for item in search_results["items"]:
            url = item.get("link")
            snippet = item.get("snippet")

            if url and not self._is_social_media_or_unwanted(url):
                results.append((url, snippet))

        return results

    def search(self, query: str) -> SearchResult:
        params = {"key": self.API_KEY, "cx": self.CX, "q": query}

        response = requests.get(self.BASE_URL, params=params)

        if response.status_code == 200:
            return SearchResult(results=self._extract_urls_and_previews(response.json()))
        else:
            raise Exception(
                f"Error in API request: {response.status_code}, {response.text}")
