from pydantic import Field
from app.core.language_models.return_types.llm_response import BaseModelUtil
from app.models.db_models.task import TaskType


class TaskCreationRT(BaseModelUtil):

    name: str = Field(
        description="A unique, user-facing title summarizing the specific problem, goal, or hypothesis. This title will be specific to the matter at hand, such as 'Improving Customer Retention' for a goal or 'Evaluating Market Demand' for a hypothesis. max number of words is 3 words"
    )

    type: TaskType = Field(
        description="The classification type of the description in lowercase: 'problem', 'goal', or 'hypothesis'."
    )

    user_description: str = Field(
        description="The original description provided by the user, detailing a specific problem, goal, or hypothesis."
    )
