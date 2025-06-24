from typing import List
from fastapi import UploadFile
from app.helpers.config_helper import Core
from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.helpers.llm_helper import LLMHelper
from app.models.db_models.company import Company
from app.services.file_service import FileService
from app.services.node_service import NodeService
from app.repositories.unit_of_work import UnitOfWork
from app.models.db_models.tree import Tree, TreeType
from app.services.answer_service import AnswerService
from app.helpers.connection_manager_helper import broadcast
from app.services.tree_decision_service import TreeDecisionService
from app.agents.tree_builder.tree_builder_agent import TreeBuilderAgent
from app.models.db_models.enums import AnalysisActors, UserChatInputType
from app.core.language_models.prompts.node.needed_models import AssistantNode
from app.agents.research_agent.research_agent import ResearchOption, Researcher
from app.core.language_models.return_types.agents.agent_rt import EXECUTION_NEEDED
from app.agents.collaboration_agent.collaboration_agent_tools import CollaborationAgentTools
from app.agents.collaboration_agent.diagnostic_agent_prompts import DiagnosticTreeAgentPrompts
from app.models.db_models.tree_analysis import TreeAnalysis, TreeAnalysisHistory, UserChatInput
from app.agents.collaboration_agent.solution_generation_agent_prompts import SolutionGenerationAgentPrompts


class CollaborationAgent:

    def __init__(self, company: Company = None, tree_analysis: TreeAnalysis = None, tree: Tree = None, task: Task = None, root_node: Node = None, llm_config=None):
        self.company = company
        self.tree = tree
        self.task = task
        self.root_node = root_node
        self.tree_analysis = tree_analysis or TreeAnalysis(tree_id=tree.id, history=[])

        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)

        self.node_service = NodeService(llm_config)
        self.tree_decision_service = TreeDecisionService()
        self.answer_service = AnswerService(company, tree, task, llm_config)
        self.file_service = FileService(company, self.core_engine.llm_config)
        
        self.agent_tools = CollaborationAgentTools(
            tree_analysis=self.tree_analysis,
            tree=self.tree,
            task=self.task,
            company=self.company,
            llm_config=self.core_engine.llm_config
        )

        if self.tree.type == TreeType.WHY:
            self.prompt_class = DiagnosticTreeAgentPrompts
        else:
            self.prompt_class = SolutionGenerationAgentPrompts
            
        self.execution_needed = EXECUTION_NEEDED

    async def run_tree_builder_agent(self, updates: str = None):
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, "Tree Builder Agent...", True)

        tree_builder_agent = TreeBuilderAgent(
            company=self.company, 
            tree_analysis=self.tree_analysis, 
            tree=self.tree, 
            task=self.task, 
            root_node=self.root_node, 
            llm_config=self.core_engine.llm_config
        )

        self.root_node, _ = await tree_builder_agent.run(updates)
        
    async def init_agent(self):
        await broadcast(self.tree.id, True, True)
        
        skip_next_step = await self.build_tree()

        if not skip_next_step:
            await self.verify_tree()
        
        await broadcast(self.tree.id, "Initialize Collaboration Agent", True)

        sys_prompt = self.prompt_class.get_system_template()

        init_user_prompt = self.prompt_class.get_init_user_template().format(
            tree_context=self.tree.payload,
            tree_structure=AssistantNode(self.root_node).model_dump_json(indent=1)
        )

        method, _ = await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            sys_prmt=sys_prompt,
            usr_prmt=init_user_prompt,
            is_history_required=True,
            continuation_token=self.tree_analysis.id
        )

        self.tree_analysis.history.append(TreeAnalysisHistory(actor=AnalysisActors.SYSTEM, payload=method))

        return self.tree_analysis

    async def handle_user_input(self, text: str = None, files: List[UploadFile] = None):
        await broadcast(self.tree_analysis.id, "...", True)
        if not text and not files:
            raise Exception("No input was provided")

        if text:
            self.tree_analysis.history.append(
                TreeAnalysisHistory(
                    actor=AnalysisActors.USER,
                    payload=UserChatInput(text=text)
                )
            )

        if files:
            await broadcast(self.tree_analysis.id, "Reading uploaded files...", True)

            files_facts = await self.file_service.get_facts(files, tree_id=self.tree.id, task_id=self.task.id)
            for file in files:
                self.tree_analysis.history.append(
                    TreeAnalysisHistory(
                        actor=AnalysisActors.USER,
                        payload=UserChatInput(
                            text=file.filename,
                            file=files_facts[file.filename],
                            type=UserChatInputType.FILE
                        )
                    )
                )

        prompt_params = {}

        prompt_params["text"] = text if text else ""

        if files:
            prompt_params["files"] = f"Attatched Resources: {files_facts}"
        else:
            prompt_params["files"] = ""

        user_prompt = self.prompt_class.get_user_template().format(**prompt_params)

        await broadcast(self.tree_analysis.id, "Typing...", True)

        method, certainity = await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            sys_prmt=None,
            usr_prmt=user_prompt,
            is_history_required=True,
            continuation_token=self.tree_analysis.id
        )

        while True:
            payload = TreeAnalysisHistory(actor=AnalysisActors.SYSTEM, payload=method)
            self.tree_analysis.history.append(payload)

            if method['method_name'] in self.execution_needed:
                method, certainity = await self.agent_tools.execute(method, certainity)
            else:
                break

        await self.repos.tree_analyses.update(self.tree_analysis.id, self.tree_analysis)

        return payload

    async def build_tree(self):
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, "Decomposing the initial tree...", True)
        
        skip_next_step = True
        if not self.root_node.children:
            self.root_node.children = await self.node_service.decompose_using_agent(self.root_node.id, self.tree.id)
            skip_next_step = False

        for child in self.root_node.children:
            if not child.children:
                await self.node_service.decompose_using_agent(child.id, self.tree.id)
                skip_next_step = False

        self.root_node = await self.repos.nodes.get_node_with_children(self.root_node.id)
        
        if not skip_next_step:
            tree_builder_command = (
                "Check the company and task inforamtion for any usefull data"
            )

            await self.run_tree_builder_agent(tree_builder_command)

        return skip_next_step
    
    async def verify_tree(self):
        researcher = Researcher(
            company=self.company, 
            tree=self.tree, 
            task=self.task, 
            root_node=self.root_node, 
            llm_config=self.core_engine.llm_config
        )

        options = ResearchOption(from_files=True, from_online=False) # set this to true if you want the online search

        files_update_command, online_update_command = await researcher.run(options)

        if files_update_command:
            await self.run_tree_builder_agent(files_update_command)
        
        if online_update_command:
            await self.run_tree_builder_agent(online_update_command)