from typing import List
from pydantic import BaseModel, Field

class BaseModelUtil(BaseModel):
    def __str__(self):
        return self.model_dump_json(indent=4)
    

class WithQuestionsRT(BaseModelUtil):
    questions_to_user: List[str] = Field(
        default=[],
        description="""
            This field contains a list of up to 5 clarifying questions from you to the user if needed. 
            These questions are designed to gather essential context or missing details that will help you generate a more accurate
            and relevant response. Each question should be concise, ensuring that the user can answer in short text.
            Limit the questions to only those that directly improve the decision-making process and avoid unnecessary inquiries."""
    )

class WithExplanationsRT(BaseModelUtil):
    certainty: float = Field(
        default=0,
        description="The certainty percentage indicating the model's confidence in this classification/choice/output."
    )
    explanation: str = Field(
        default="",
        description="An explanation of the certainty score, justifying why this classification/choice/output was chosen."
    )


class StringRT(BaseModelUtil):
    output: str = Field(
        description="This field contains the string answer generated by you."
    )
