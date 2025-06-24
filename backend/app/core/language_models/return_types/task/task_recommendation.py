from typing import List
from pydantic import Field

from app.core.language_models.return_types.llm_response import BaseModelUtil, WithExplanationsRT

class TaskRecommendationRT(WithExplanationsRT):
    short_display_title: str = Field(description="A display title for the action to the user: 'Problem Exploration' for a Problem, 'Solutions Exploration' for a Goal, and 'Test Your Hypothesis' for a Hypothesis.")
    
    type: str = Field(
        description="The classification of the description: 'Problem', 'Goal', or 'Hypothesis'. the value must be in lowercase"
    )
    
    tree_type: str = Field(
        description="The recommended tree type for analysis based on the classification: 'Why Tree' for a Problem, 'How Tree' for a Goal, and 'Hypothesis Tree' for a Hypothesis. the value must be in lowercase"
    )

class TaskRecommendationListRT(BaseModelUtil):
    recommendation: List[TaskRecommendationRT] = Field(
       description= "A list of recommended analysis paths based on the classification of the description."
    )
