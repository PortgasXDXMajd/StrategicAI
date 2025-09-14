from typing import Any, Dict, Optional
from app.core.web_scrap.web_scraper import ScrapResult
from app.core.web_search.models import SearchResult
from app.models.dynamic_models.company_profile import CompanyProfile

class ExtractorPrompts:
    @classmethod
    def get_system_prompt(cls) -> str:
        return """
            You are an advanced assistant designed to extract, analyze, and update comprehensive information about a company to assist in strategic decision-making. 
            Your primary objective is to construct a thorough and insightful profile of the company by identifying and organizing all relevant details provided by the user.

            You should consider a wide range of company attributes, such as its operations, financial performance, products, services, market position, competitors, leadership, industry dynamics, and partnerships. 
            Avoid restricting your focus; instead, extract all meaningful insights from the provided data.

            If there are gaps or missing essential details, generate up to 5 clarifying questions to address these gaps. These questions should be general enough to cover broad areas of importance.

            Your ultimate goal is to ensure that the information extracted is detailed, structured, and useful for making informed, strategic business decisions.
        """

    @classmethod
    def get_prompt_to_extract_company_information(
        cls,
        company_profile: Optional[CompanyProfile],
        search_results: SearchResult,
        scrap_results: ScrapResult,
    ) -> str:
        profile_str = (
            company_profile.model_dump_json(indent=2)
            if company_profile
            else "No existing company profile. You are creating a new profile from scratch."
        )

        return f"""
            You are provided with new information about a company to create or enhance its profile.

            ### Existing Company Profile:
            {profile_str}
            This is the existing profile. If it's empty, you must create a new one based on the information below.

            ### Search Results:
            {search_results}
            These are URLs and snippets containing potential information.

            ### Scraped Website Contents:
            {scrap_results}
            This is the detailed content from the websites found in the search results.

            ### Your Task:
            Based on the search and scraped content, perform the following:
            1.  **Analyze and Extract:** Thoroughly review all provided information to extract relevant company details. Focus on company size, industry, business model, products, services, revenue, market position, competitors, leadership, and recent activities.
            2.  **Update and Augment:** Update the existing profile with new, more accurate information. Add any valuable new details discovered, even if they don't correspond to an existing field.
            3.  **Identify Gaps:** If essential information for strategic analysis is missing, generate up to 5 clarifying questions for the user.
            4.  **Format Output:** Deliver the final extracted and updated data as a single, detailed JSON object structured to represent the company's profile.
        """

    @classmethod
    def get_prompt_to_update_company_profile_given_answers(
        cls, company_profile: Optional[CompanyProfile], qa: Dict[str, str]
    ) -> str:
        profile_str = (
            company_profile.model_dump_json(indent=2)
            if company_profile
            else "No existing company profile data."
        )

        return f"""
            You are tasked with updating a company profile using new answers provided by the user.

            ### Current Company Profile:
            {profile_str}

            ### User-Provided Answers (Q&A):
            {qa}

            ### Your Objectives:
            1.  **Integrate New Data:** Carefully integrate the user's answers into the company profile.
            2.  **Fill Gaps:** Use the new information to fill in any missing or incomplete fields.
            3.  **Update Existing Data:** If an answer provides more recent or accurate information, update the corresponding field.
            4.  **Ensure Consistency:** Maintain data consistency and remove any redundancies or conflicts.
            5.  **Preserve Value:** Retain all existing valuable data that is not superseded by the new answers.

            Return the complete, updated company profile as a structured JSON object.
        """

    @classmethod
    def get_prompt_to_update_company_profile(
        cls, company_profile: Optional[CompanyProfile], user_input: Any
    ) -> str:
        profile_str = (
            company_profile.model_dump_json(indent=2)
            if company_profile
            else "No existing company profile data."
        )

        return f"""
            You are tasked with updating a company profile using new, unstructured data provided by the user.

            ### Current Company Profile:
            {profile_str}

            ### New User Input (Text, Tables, File Contents):
            {str(user_input)}

            ### Your Objectives:
            1.  **Comprehensive Analysis:** Thoroughly analyze all user-provided data to extract meaningful insights.
            2.  **Extract Financial Data:** Pay special attention to extracting and organizing all financial data, including:
                -   **Operating Metrics:** Net sales, cost of sales, operating income, total operating expenses.
                -   **Non-Operating Metrics:** Interest income/expense, other income/expense, equity-method investment activity.
                -   **Tax Information:** Provision for income taxes.
                -   **Profitability:** Income before taxes, and net income/loss.
            3.  **Update and Integrate:** Add or update the profile with the newly extracted details, ensuring accuracy and consistency. Do not exclude any significant financial or operational data.
            4.  **Logical Structure:** Organize all data logically within the profile.

            Output the final, updated company profile as a single, structured JSON object.
        """
