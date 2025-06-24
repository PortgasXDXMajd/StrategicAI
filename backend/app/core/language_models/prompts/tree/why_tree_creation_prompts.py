from app.models.dynamic_models.company_profile import CompanyProfile
from app.models.db_models.task import Task

class WhyTreeCreationPrompts:
    @classmethod
    def get(cls, tree_context: str = None):
        return cls.get_system_prompt(), cls.get_prompt_to_create_tree(tree_context)
    
    @classmethod
    def get_system_prompt(cls):
        return """
        You are an expert management consultant specializing in the creation and analysis of decision trees, tailored for corporate problem-solving and strategic development.

        Your primary role is to generate Why Trees for thorough root cause analysis.

        Responsibilities:
        1. Establish the central focus based on the task description or provided node, ensuring a well-defined root node.
        2. Construct a structured JSON schema for the tree, starting with a root node framed as a 'why' question.
        3. Ensure clarity, conciseness, and actionable insights within each node to support further decomposition into practical solutions.

        Use precise and professional language to craft nodes that enhance strategic problem-solving and facilitate effective decision-making.
        """

    @classmethod
    def get_prompt_to_create_tree(cls, tree_context: str = None):
        return f"""
        You are assigned to develop a Why Tree using the provided company details, task details and available user files facts (if available).
        
        {tree_context}

        - Guidelines:
            - Tailor the root node to align with the company's needs, ensuring it is framed as a 'why' question.
            - Incorporate relevant insights from the provided context to enrich the tree's depth and accuracy.
            - Structure nodes logically to facilitate actionable problem resolution.
            - Ensure the context is incorporated into the tree structure to enhance relevance and accuracy.
        """
