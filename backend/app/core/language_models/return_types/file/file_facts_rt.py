from typing import List
from app.core.language_models.return_types.llm_response import BaseModelUtil


class FactsRT(BaseModelUtil):
    facts: List[str]