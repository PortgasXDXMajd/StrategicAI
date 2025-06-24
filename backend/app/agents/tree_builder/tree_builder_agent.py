from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.helpers.llm_helper import LLMHelper
from app.models.db_models.company import Company
from app.agents.base.base_agent import BaseAgent
from app.helpers.string_helper import StringHelper
from app.helpers.tools_helper import get_tools_info
from app.models.db_models.tree import Tree, TreeType
from app.helpers.connection_manager_helper import broadcast
from app.models.db_models.tree_analysis import TreeAnalysis
from app.core.language_models.prompts.node.needed_models import AssistantNode
from app.agents.tree_builder.tree_builder_agent_tools import TreeBuilderAgentTools
from app.core.language_models.return_types.agents.agent_rt import EXECUTION_NEEDED
from app.agents.tree_builder.tree_builder_agent_prompts import TreeBuilderProblemAgentPrompts, TreeBuilderSolutionAgentPrompts


class TreeBuilderAgent(BaseAgent):

    def __init__(self, company: Company, tree_analysis: TreeAnalysis, tree: Tree, task: Task, root_node: Node, llm_config=None):
        super().__init__(
            company=company,
            task=task,
            tree=tree,
            root_node=root_node,
            tree_analysis=tree_analysis,
            llm_config=llm_config)

        self.agent_tools = TreeBuilderAgentTools(
            tree_analysis=self.tree_analysis,
            tree=self.tree
        )

        if tree.type == TreeType.WHY:
            self.prompt_class = TreeBuilderProblemAgentPrompts
        else:
            self.prompt_class = TreeBuilderSolutionAgentPrompts

        self.tools_signiture = self.agent_tools.get_tools()
        self.execution_needed = EXECUTION_NEEDED

    async def run(self, updates: str = None):
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, "Tree Builder Agent...", True)

        tree_structure_updates_logs = []

        await broadcast(self.tree.id, "Adjusting Tree Structure...", True)

        sys_prompt = self.prompt_class.system_prompt()

        user_prompt = self.prompt_class.user_prompt().format(
            context=self.tree.payload,
            tree_structure=AssistantNode(self.root_node).model_dump_json(indent=2),
            tools=get_tools_info(self.tools_signiture)
        )

        cont_token = StringHelper.generate_uuid()

        if updates is not None:
            user_prompt += f"\nUser Input:\n{updates}"

        while True:
            
            method, certainity = await LLMHelper.safe_generate_response(
                core_engine=self.core_engine,
                sys_prmt=sys_prompt,
                usr_prmt=user_prompt,
                is_history_required=True,
                continuation_token=cont_token
            )

            if method['method_name'] in self.execution_needed:
                self.root_node, log = await self.agent_tools.execute(method, certainity)

                await broadcast(self.tree.id, self.root_node)

                tree_structure_updates_logs.append(log)
            else:
                break

            sys_prompt = None
            user_prompt = self.prompt_class.continuation_prompt().format(
                tree_structure=AssistantNode(self.root_node).model_dump_json(indent=2)
            )
        
        return self.root_node, tree_structure_updates_logs