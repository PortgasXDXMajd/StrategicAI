from app.core.language_models.return_types.llm_response import BaseModelUtil

class HypothesisNodeRT(BaseModelUtil):
    answer: str
    is_answer_found: bool