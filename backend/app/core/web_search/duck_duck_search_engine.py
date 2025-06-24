from typing import List, Tuple
from app.core.web_search.models import SearchResult
from langchain_community.tools import DuckDuckGoSearchResults


class DuckDuckSearchEngine:
    def __init__(self):
        self.engine = DuckDuckGoSearchResults(output_format="list")

    def _extract_urls_and_previews(self, search_results) -> List[Tuple[str, str]]:
        results = []
        for item in search_results:
            url = item.get("link")
            snippet = item.get("snippet")
            results.append((url, snippet))

        return results

    def search(self, query: str) -> SearchResult:
        res = self.engine.invoke(query)
        
        return SearchResult(results=self._extract_urls_and_previews(res))
