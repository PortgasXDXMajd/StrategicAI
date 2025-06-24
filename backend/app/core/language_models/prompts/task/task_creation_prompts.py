from app.models.dynamic_models.company_profile import CompanyProfile
from app.models.dtos.task.create_task_dto import CreateTaskDto


class TaskCreationPrompts:

    @classmethod
    def get_system_prompt(cls):
        return """
            You are an assistant specializing in creating tailored decision-making objects for companies. 
            Your task is to use the provided data to create a structured response representing a unique company challenge, objective, or hypothesis in a user-friendly format.
            The Task description by the user might be not related to the company by itself, so in that case create a task that is generic without the connection to the company itself.
        """

    @classmethod
    def get_prompt_to_create_task(cls, create_task_dto: CreateTaskDto, company_profile: CompanyProfile, include_company_context: bool = True):

        if include_company_context:
            company_context = f"""
            - Company Context:
                {company_profile.get_company_context()}
            """
        else:
            company_context = ''

        return f"""
            Using the information provided, generate a task Object that captures the details of a specific problem, goal, or hypothesis for strategic decision-making.

            - Task Object Data:
            {create_task_dto.get_task_as_prompt()}

            {company_context}

            Your task:
            - Based on the details in the `task Object Data`, classify the description as a 'problem', 'goal', or 'hypothesis'.
            - Formulate a unique name for the task object that summarizes the specific issue, objective, or hypothesis for the user.
        """
