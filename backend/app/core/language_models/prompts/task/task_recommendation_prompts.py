from app.models.dynamic_models.company_profile import CompanyProfile

class TaskRecommendationPrompts:

    @classmethod
    def get_system_prompt(cls):
        return """
        You are a strategic decision-making assistant for companies, specializing in identifying the best analytical approach for any given description. Your job is to analyze the description and evaluate how well it fits each of the following categories:

        - **Problem**: Indicates an issue needing cause analysis. Recommend a **Why Tree**.
        - **Goal**: Specifies an objective requiring potential solution paths. Suggest a **How Tree**.
        - **Hypothesis**: Describes an assumption to test or validate. Recommend a **Hypothesis Tree**.

        After analyzing the description, provide a list of recommendations, one for each category (Problem, Goal, Hypothesis), including:
        - The type: 'problem', 'goal', or 'hypothesis' (in lowercase)
        - The recommended tree type: 'why tree', 'how tree', or 'hypothesis tree' (in lowercase)
        - A short display title: 'Problem Analysis', 'Solutions Exploration', or 'Solution Validation'
        - A certainty percentage (0-100%) indicating how likely the description fits that category
        - A brief explanation justifying the certainty score, based on the description and company context

        Ensure you evaluate all three categories, providing a certainty percentage and explanation for each, even if the description strongly aligns with only one type.
        Make sure all certainity must be between 0 and 100, and the sum of all three certainity must be 100.
        """

    @classmethod
    def get_prompt_to_recommend_tasks_starting_point(cls, user_description: str, company_profile: CompanyProfile):
        return f"""
        Given the following description and company context, analyze the description to determine how well it fits each of the three categories: Problem, Goal, and Hypothesis, in the context of strategic decision-making at {company_profile.company_name}.

        - Description: "{user_description}"
        - Company Context:
        {company_profile.model_dump_json()}

        Your task:
        - Evaluate the description against each category: Problem, Goal, and Hypothesis.
        - For each category, provide:
        - A certainty percentage (0-100%) indicating how likely the description fits that category.
        - A brief explanation for the certainty score, based on the description and company context.
        - Ensure all certainty percentages are between 0 and 100, and the sum of all three must equal 100.
        """
