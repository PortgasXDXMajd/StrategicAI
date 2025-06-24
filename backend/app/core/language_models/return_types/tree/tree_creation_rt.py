from pydantic import Field
from app.core.language_models.return_types.llm_response import BaseModelUtil

class TreeCreationRT(BaseModelUtil):
    tree_title: str = Field(description="A user-facing title for the tree summarizing the purpose of it. max number of words is 3 words")
    root_node_text: str = Field(description="This is main text area in a node where the user will read its content")