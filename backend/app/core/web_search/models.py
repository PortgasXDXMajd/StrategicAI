from enum import Enum
from typing import List, Tuple
from pydantic import BaseModel


class Website(Enum):
    General = "*"
    Wikipedia = "wikipedia.org"


class SearchEngine(Enum):
    Google = "google"
    DuckDuck = "duckduck"


class SearchResult(BaseModel):
    results: List[Tuple[str, str]] = []
