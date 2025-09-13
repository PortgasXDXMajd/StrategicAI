from ..core.web_search.models import SearchEngine
from ..core.web_scrap.web_scraper import WebScraper
from ..core.language_models.openai_llm import OpenAILLM
from ..models.dtos.configs.llm_type_enum import LLMConfigDto
from ..core.web_search.web_search_engine import WebSearchEngine
from ..core.language_models.fireworksai_llm import FireworkAILLM


class Core:
    def __init__(self, llm_config=None):
        self.search_engine = WebSearchEngine(search_engine=SearchEngine.DuckDuck)
        self.scraper = WebScraper()

        self.llm_config = llm_config or LLMConfigDto()

        if self.llm_config.model.startswith('gpt'):
            self.model = OpenAILLM(str(self.llm_config.model))
        else:
            self.model = FireworkAILLM(str(self.llm_config.model))
        pass
