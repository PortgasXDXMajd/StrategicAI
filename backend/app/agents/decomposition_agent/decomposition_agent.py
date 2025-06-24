from app.helpers.llm_helper import LLMHelper
from app.agents.base.base_agent import BaseAgent
from app.helpers.string_helper import StringHelper
from app.models.db_models.tree import Tree, TreeType
from app.models.db_models.node import Node, NodeType
from app.helpers.connection_manager_helper import broadcast
from app.core.language_models.prompts.node.needed_models import DecompositionHelperNode
from app.agents.decomposition_agent.decomposition_agent_prompts import DecompositionProblemAgentPrompts, DecompositionSolutionAgentPrompts


class DecompositionAgent(BaseAgent):

    def __init__(self, tree: Tree, root_node: Node, llm_config=None):
        super().__init__(
            company=None,
            task=None,
            tree=tree,
            root_node=root_node,
            tree_analysis=None,
            llm_config=llm_config)
        
        if tree.type == TreeType.WHY:
            self.prompt_class = DecompositionProblemAgentPrompts
        else:
            self.prompt_class = DecompositionSolutionAgentPrompts
        
    async def decompose(self, node_id: str):
        assert node_id, "node_id must not be None"
        node = await self.repos.nodes.get_by_id(node_id)
        assert node, "node must not be None"

        sys_prompt = self.prompt_class.system_prompt()

        user_prompt = self.prompt_class.user_prompt(is_root=(node_id==self.root_node.id)).format(
            node_text=node.text,
            tree_context=self.tree.payload,
            tree_structure=DecompositionHelperNode(self.root_node).model_dump_json(indent=2),
        )

        nodes_to_add = []
        cont_token = StringHelper.generate_uuid()

        while True:
            sub_node, certainity = await LLMHelper.safe_generate_response(
                core_engine=self.core_engine,
                sys_prmt=sys_prompt,
                usr_prmt=user_prompt,
                is_history_required=True,
                continuation_token=cont_token
            )
            
            if sub_node.get("is_done", False):
                break
            
            new_node = Node(
                text=sub_node['text'],
                tree_id=self.tree.id,
                parent_id=node.id,
                type=NodeType.NORMAL,
                certainty=certainity,
                explanation=f"{sub_node['explanation']} (NOT VERIFIED WITH DATA YET)",
            )

            nodes_to_add.append(new_node)

            await self.repos.nodes.create(new_node)

            self.root_node = await self.repos.nodes.get_node_with_children(self.root_node.id)

            await broadcast(self.tree.id, self.root_node)

            sys_prompt = None
            user_prompt = "Continue"

        return nodes_to_add
