from app.models.db_models.node import Node
from app.models.db_models.tree import Tree
from app.helpers.llm_helper import LLMHelper
from app.agents.base.base_agent import BaseAgent
from app.core.language_models.prompts.node.needed_models import AssistantNode


class SolutionWriterAgent(BaseAgent):

    def __init__(self, tree: Tree, llm_config=None):
        super().__init__(
            company=None,
            task=None,
            tree=tree,
            root_node=None,
            tree_analysis=None,
            llm_config=llm_config
        )

    async def run(self, how_solution_node: Node):
        solution_node_with_children = await self.repos.nodes.get_node_with_children(how_solution_node.id)
        solution_node_as_prompt = AssistantNode(solution_node_with_children).get_string()
        
        sys_prompt = f"""
            You are a Professional Consultant.  
            Your task is to write a structured implementation guide for a company based on a given solution tree.  

            The solution tree represents a structured breakdown of how to achieve a particular goal. The root node describes the main solution, while its children and further descendants provide step-by-step details or alternative approaches to implementation.

            Your job is to:
            - Analyze the relationship between parent and child nodes.
            - Identify whether child nodes represent **steps** (sequential tasks) or **options** (alternative approaches).
            - Logically integrate these into a clear, structured guide to help the company implement the solution effectively.  

            You will be provided with:
            1. Company and Task Information – Details about the company, its objectives, and the problem being solved.  
            2. Solution Node Structure – A hierarchical breakdown of the solution, where each node represents either a required step or an optional approach.

            Your response should:
            - Clearly outline the steps required to implement the solution.
            - Distinguish between required steps (that must be followed in sequence) and alternative approaches (where a choice can be made).
            - Integrate explanations logically to ensure clarity and practical execution.
            - Ensure the guide is structured and actionable, helping decision-makers understand their options and next actions.

            Use a professional and structured format for clarity.
            """

        user_prompt = f"""
            Given the following details:

            Company and Task Information:
            {self.tree.payload}

            Solution Node Structure:
            {solution_node_as_prompt}

            Write a structured guide on how the company should implement the solution.  
            - Identify whether each child node represents a step (part of a sequence) or an option (an alternative).  
            - If multiple options exist, explain them and provide guidance on how to choose the best one.  
            - If steps must be followed in order, present them sequentially with clear instructions.  
            - Ensure the guide is practical, well-structured, and easy to follow.

            Format your response to be professional and actionable.
        """

        description, _ = await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            sys_prmt=sys_prompt,
            usr_prmt=user_prompt,
            is_history_required=False,
            return_string=True
        )

        return description
