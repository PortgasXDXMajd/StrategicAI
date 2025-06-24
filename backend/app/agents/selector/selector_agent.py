from functools import reduce
from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.helpers.llm_helper import LLMHelper
from app.models.db_models.company import Company
from app.agents.base.base_agent import BaseAgent
from app.models.db_models.tree import Tree, TreeType
from app.helpers.connection_manager_helper import broadcast
from app.models.db_models.tree_analysis import TreeAnalysis
from app.core.language_models.prompts.node.needed_models import AssistantNode


class SelectorAgent(BaseAgent):

    def __init__(self, company: Company, tree_analysis: TreeAnalysis, tree: Tree, task: Task, root_node: Node, llm_config=None):
        super().__init__(
            company=company,
            task=task,
            tree=tree,
            root_node=root_node,
            tree_analysis=tree_analysis,
            llm_config=llm_config
        )

    async def run(self):
        await broadcast(self.tree.id, "Selecting nodes...", True)

        if self.tree.type == TreeType.WHY:
            sys_prompt = """
                You are a root cause analysis expert. Your task is to rigorously identify the actual root causes of a company's problem from a Why Tree while ensuring that the selection is MECE (Mutually Exclusive, Collectively Exhaustive).

                Selection Priorities
                1. DATA-DRIVEN EVIDENCE (Primary Filter)
                - Prioritize nodes with:
                    - Quantitative metrics (e.g., "30% increase in errors")
                    - Documented incidents (e.g., "5 outages in Q3")
                    - Measurable trends (e.g., "Customer satisfaction drop for 3 consecutive quarters")
                    - Domain expertise with historical validation (e.g., "Verified correlation between X and Y in 2023 audit")
                - If multiple nodes describe the same issue, select the most specific one.

                2. MECE ENFORCEMENT (New Filter)
                - Mutually Exclusive: Ensure selected nodes do not overlap in meaning.
                - Collectively Exhaustive: Ensure all major aspects of the problem are covered.

                3. LOGICAL SOUNDNESS (Fallback if No Data)
                - If no strong data-backed nodes exist, select nodes based on clear cause-effect reasoning.
                - Logical causes must be distinct from each other.

                4. FINAL EXCLUSION CHECK
                - Remove nodes with vague, anecdotal, or generic reasoning.
                - Remove overlapping nodes in favor of the strongest one.

                Response Format:
                ["node_id_1", "node_id_2", ...] (JSON array)
                All outputs must be a valid json string (\" and not ' for values)
            """
            user_prompt = (
                "Given details about a company and its task:\n"

                "Company and Task Information:\n"
                
                f"{self.tree.payload}\n\n"
                
                "Why Tree Structure\n"
                f"{AssistantNode(self.root_node)}\n\n"
                                
                "Select 1-5 nodes that are root causes of the problem mentioned in the Task Description"

                "Response Format:\n"
                """["node_id_1", "node_id_2", ...] (JSON array)"""
                "All outputs must be a valid json string (\" and not ' for values)"
            )
        else:
            # we select nodes fro mthe first layer of the tree only
            sys_prompt = f"""
                You are a solution validation expert. Your task is to identify the most effective standalone solutions from a How Tree.

                Selection Priorities:

                1. STANDALONE SOLUTIONS ONLY
                - Select only nodes that fully solve the root problem, rather than incremental steps or sub-actions.  
                - Ignore nodes that are merely components, dependencies, or implementation details of a broader parent solution.  
                - If a node has a parent that represents a broader, more comprehensive solution, prioritize the parent instead.  

                2. MECE (MUTUALLY EXCLUSIVE, COLLECTIVELY EXHAUSTIVE) SELECTION  
                - Ensure that the selected solutions **do not overlap** in scope or approach.  
                - Each chosen solution should contribute to solving the root problem in a distinct, non-redundant way.  
                - Together, the selections should cover the problem comprehensively without unnecessary duplication.

                3. DATA-DRIVEN EFFECTIVENESS
                - Prioritize solutions with:  
                - Success metrics (e.g., "Increased conversion by 15% in pilot")  
                - Case study references (e.g., "Implemented by Company X in 2023")  
                - ROI projections with supporting calculations  
                - Resource estimates with specific details  

                4. LOGICAL RIGOR DATA FALLBACK
                - If no data-supported solutions exist, select solutions that:  
                - Have clear operational logic
                - Align with the company's capabilities and resources  

                5. EXCLUSION CRITERIA 
                Reject solutions that:  
                - Are vague or unclear in implementation  
                - Do not directly address the root problem 
                - Are generic, non-actionable, or redundant  

                Response Format:
                JSON array of selected node IDs (1 to 5 items).  
                Example: ["node_id_1", "node_id_2", "node_id_3"]
                All outputs must be a valid json string (" and not ' for values)
                """

            user_prompt = f"""
                Given details about a company and its task:

                Company and Task Information:
                {self.tree.payload}

                Solution Issue Tree Structure with Only Standalone, MECE Solutions:
                {AssistantNode(self.root_node).get_children_from_layer_as_list(layer=1)}

                Selection Task:
                Identify the best mutually exclusive, collectively exhaustive (MECE) standalone solutions that fully solve the root problem **without overlap.

                Output:
                JSON array of selected node IDs: ["node_id_1", "node_id_2", ...]
                All outputs must be a valid json string (" and not ' for values)
            """

        node_ids_list = []
        for _ in range(0, 3):
            node_ids, _ = await LLMHelper.safe_generate_response(
                core_engine=self.core_engine,
                sys_prmt=sys_prompt,
                usr_prmt=user_prompt,
                is_history_required=False
            )
            node_ids_list.append(node_ids)
        
        # Self-Consistency
        common_node_ids = list(reduce(set.intersection, map(set, node_ids_list)))

        return common_node_ids
