from typing import Any, Dict
from app.core.web_scrap.web_scraper import ScrapResult
from app.core.web_search.models import SearchResult
from app.models.dynamic_models.company_profile import CompanyProfile

class ExtractorPrompts:
    @classmethod
    def get_system_prompt(cls):
        return """
            You are an advanced assistant designed to extract, analyze, and update comprehensive information about a company to assist in strategic decision-making. 
            Your primary objective is to construct a thorough and insightful profile of the company by identifying and organizing all relevant details provided by the user.

            You should consider a wide range of company attributes, such as its operations, financial performance, products, services, market position, competitors, leadership, industry dynamics, partnerships, and any other data that could influence strategic decision-making. 
            Avoid restricting your focus to specific fields or preferences; instead, extract all meaningful insights from the data provided.

            If there are gaps or missing essential details that could significantly impact strategic analysis, generate up to 5 clarifying questions to address these gaps. These questions should be general enough to cover broad areas of importance and not restricted to overly specific or time-sensitive details.

            Your ultimate goal is to ensure that the information extracted and presented is detailed, structured, and useful for making informed, strategic business decisions.
        """

    @classmethod
    def get_prompt_to_extract_company_information(
        cls, company_profile: CompanyProfile, search_results: SearchResult, scrap_results: ScrapResult
    ):
        return f"""
            You are provided with detailed information related to a company for the purpose of expanding and enhancing its company profile.
            
            Company Profile:
            {company_profile.model_dump_json()}
            This is the existing profile containing the current known data about the company.
            
            Search Results:
            {search_results}
            These are a set of URLs and related snippets containing potential information about the company.

            Scraped Website Contents:
            {scrap_results}
            These are the detailed contents of the websites associated with the URLs from the search results.

            Your Task:

            Based on the information provided from the search results and scraped contents, your goals are:
            - Thoroughly analyze all provided information to extract as many relevant details about the company as possible.
            - Extract specific information on company size, industry, business model, products, services, revenue, market position, competitors, leadership, recent activities, notable partnerships, and any other data that may aid in future strategic decisions.
            - If you find any essential information missing from the current profile or provided data, generate up to 5 clarifying questions to ask the user. These questions should focus on gathering important company information that is crucial for decision-making and avoid asking for specific time-sensitive details.
            - Update or add any new information to the company's dynamic fields in the profile. If any field in the profile has insufficient or outdated information, replace it with accurate details from the search and scrap results.
            - Ensure that the extracted data is provided in the form of a dictionary that will be incorporated into the dynamic field of the company profile.
            - Add any extra relevant information even if it was not explicitly mentioned in the original profile but could be valuable for future decisions.

            Deliver the final extracted and updated data in the form of a detailed JSON dictionary, structured to reflect all updated and newly found details. Each entry should indicate its source (e.g., search results, scraped content) and note its relevance to potential strategic decisions the managers might face.
        """
    
    @classmethod
    def get_prompt_to_update_company_profile_given_answers(cls, company_profile: CompanyProfile, qa: Dict[str, str]):
        return f"""
            You are tasked with updating and enhancing a company profile using both previously known data and new information provided by the user.

            Company Profile (Current Data):
            {company_profile.model_dump_json()}

            User-provided Data (New Information):
            {qa}

            Your Objectives:
            1. Identify any gaps or incomplete information in the existing company profile.
            2. Add new data where applicable, ensuring that it complements and enhances the current profile.
            3. For existing data, update any fields where the new information is more recent or more accurate.
            4. Ensure consistency across all fields, removing any redundancy or conflicts between old and new data.
            5. Retain all existing valuable data that is not being replaced by the new information.

            Please focus on updating the following aspects of the company profile based on the user responses:
            - Company name, location, industry, and website
            - Business operations, financials, and key personnel
            - Any other information relevant for strategic decision-making.

            Return the updated company profile in a structured JSON format, ready for use.
        """
    
    @classmethod
    def get_prompt_to_update_company_profile(cls, company_profile: CompanyProfile, user_input: Any):
        return f"""
            You are tasked with updating and enhancing a company profile based on both the existing profile data and new information provided by the user, including text, tables, and uploaded files.

            Current Company Profile:
            {company_profile.model_dump_json()}

            User Input:
            {str(user_input)}

            Your Objectives:
            1. Analyze all user-provided data thoroughly, including any structured or unstructured text and uploaded files, to identify all meaningful insights about the company.
            2. Extract and organize all financial data comprehensively. This includes, but is not limited to:
                - Operating metrics such as net sales, cost of sales, operating income, and total operating expenses.
                - Non-operating metrics such as interest income, interest expense, other income/expenses, and equity-method investment activity.
                - Tax-related information such as provision for income taxes.
                - Income before taxes and net income (or loss).
            3. Ensure that no significant financial or operational data is excluded, even if it is not explicitly requested or categorized. Include all values directly impacting the financial performance and operational context.
            4. Update or add newly extracted details to the profile where applicable, ensuring accuracy and consistency across all fields.
            5. Organize all data logically in a structured and detailed format, ensuring that it is complete and avoids redundancy or conflicts.
            6. Maintain flexibility in interpreting what constitutes important information, considering all data as potentially relevant for strategic decision-making.

            Output the updated company profile as a structured JSON object. Ensure that:
            - All data is categorized and formatted for clarity and consistency.
            - The source of each piece of new or updated information (e.g., "from user text" or "from uploaded file") is clearly noted.

            Your ultimate goal is to provide a complete and detailed company profile, capturing all relevant financial, operational, and contextual data to support strategic decision-making.
        """