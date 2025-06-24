from app.core.cohere_retriever import CohereRetriever
from .models import SearchEngine, SearchResult, Website
from .google_search_engine import GoogleSearchEngine
from .duck_duck_search_engine import DuckDuckSearchEngine


class WebSearchEngine:

    def __init__(self, search_engine: SearchEngine = SearchEngine.DuckDuck):
        self.cohere_retriver =  CohereRetriever()

        if search_engine == SearchEngine.DuckDuck:
            self.engine = DuckDuckSearchEngine()
        elif search_engine == SearchEngine.Google:
            self.engine = GoogleSearchEngine()
        else:
            raise Exception(
                f"Search Engine '{search_engine.value}' is not supported.")

    def search(self, query: str, website: Website = Website.General, topk: int = 3) -> SearchResult:
        if website != Website.General:
            query = f"{query} site:{website.value}"

        searching_results = self.engine.search(query)

        urls, snippets = zip(*searching_results.results) if searching_results.results else ([], [])

        ordered_snippets = self.cohere_retriver.rerank(query, docs=snippets, top_n=topk)
            
        final_results = [(urls[snippets.index(s)], s) for s in ordered_snippets]

        return SearchResult(results= final_results)



