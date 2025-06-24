from typing import List
from fastapi import UploadFile
from app.helpers.config_helper import Core
from app.models.db_models.node import Node
from app.models.db_models.task import Task
from app.models.db_models.company import Company
from app.services.node_service import NodeService
from app.services.file_service import FileService
from app.services.tree_service import TreeService
from app.repositories.unit_of_work import UnitOfWork
from app.models.db_models.tree import Tree, TreeType
from app.helpers.connection_manager_helper import broadcast
from app.agents.selector.selector_agent import SelectorAgent
from app.services.hypothesis_service import HypothesisService
from app.models.dtos.tree.create_tree_dto import CreateTreeDto
from app.services.tree_decision_service import TreeDecisionService
from app.agents.tree_builder.tree_builder_agent import TreeBuilderAgent
from app.agents.research_agent.research_agent import ResearchOption, Researcher


class AutoAgent:
    def __init__(self, company: Company = None, tree: Tree = None, task: Task = None, root_node: Node = None, llm_config=None):

        self.company = company
        self.tree = tree
        self.task = task
        self.root_node = root_node
        self.action_trace = []

        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)

        self.node_service = NodeService(llm_config)
        self.tree_decision_service = TreeDecisionService()
        self.tree_service = TreeService(self.core_engine.llm_config)
        self.file_service = FileService(company, self.core_engine.llm_config)

    async def run(self, files: List[UploadFile] = []):
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, "Initializing Auto Agent", True)

        await self.process_uploaded_files(files)

        await self.build_tree()

        tree_builder_command = (
            "Check the company and task inforamtion for any usefull data"
        )
        await self.run_tree_builder_agent(tree_builder_command)

        await self.verify_tree()

        await self.make_decision()

        lastest_tree_structure = await self.repos.nodes.get_node_with_children(self.root_node.id)

        await broadcast(self.tree.id, "Finishing up...", True)
        await broadcast(self.tree.id, lastest_tree_structure)

    async def run_tree_builder_agent(self, updates: str = None):
        tree_builder_agent = TreeBuilderAgent(
            company=self.company, 
            tree_analysis=None, 
            tree=self.tree, 
            task=self.task, 
            root_node=self.root_node, 
            llm_config=self.core_engine.llm_config
        )

        self.root_node, logs = await tree_builder_agent.run(updates)

        self.action_trace.extend(logs)

    async def process_uploaded_files(self, files: List[UploadFile]):
        await broadcast(self.tree.id, True, True)
        if files:
            self.action_trace.append(
                f"Processing uploaded files: {len(files)} file(s)")
            await broadcast(self.tree.id, "Processing uploaded files", True)
            await self.file_service.get_facts(files, tree_id=self.tree.id, task_id=self.task.id)
            await broadcast(self.tree.id, "refresh", True)

    async def make_decision(self):
        await broadcast(self.tree.id, True, True)
        await broadcast(self.tree.id, self.root_node.id, True)
        await broadcast(self.tree.id, "Making Decision...", True)
        self.action_trace.append("making decision")

        selector_agent = SelectorAgent(
            company=self.company,
            tree_analysis=None,
            tree=self.tree,
            task=self.task,
            root_node=self.root_node,
            llm_config=self.core_engine.llm_config
        )

        ids = await selector_agent.run()
        
        try:
            await self.tree_decision_service.delete_by_tree_id(self.tree.id)
        except:
            pass

        if self.tree.type == TreeType.WHY:
            root_causes_nodes = self.tree.get_deepest_unrelated_nodes(self.root_node, ids)
            for root_cause in root_causes_nodes:
                await self.tree_decision_service.toggle_node_as_decision(root_cause.id, must_add=True)
        else:
            for node_id in ids:
                await broadcast(self.tree.id, True, True)
                
                node = await self.repos.nodes.get_by_id(node_id)
                if not node:
                    continue

                await broadcast(self.tree.id, node_id, True)
                await broadcast(self.tree.id, f"Creating A Hypothesis Tree: {node.text}", True)

                hypo_trees = await self.tree_service.create_tree(
                    create_tree_dto=CreateTreeDto(
                        task_id=self.task.id, 
                        type=TreeType.HYPOTHESIS, 
                        node_id=node_id
                    ),
                    company=self.company
                )

                await broadcast(self.tree.id, "refresh", True)

                hypo_tree = hypo_trees[0]

                hypothesis_service = HypothesisService(hypo_tree.id, self.company, self.core_engine.llm_config)

                await hypothesis_service.start_hypothesis_test(node_id=hypo_tree.root_node_id, noti_id=self.tree.id)

    async def build_tree(self):
        if not self.root_node.children:
            self.root_node.children = await self.node_service.decompose_using_agent(self.root_node.id, self.tree.id)

        for child in self.root_node.children:
            if not child.children:
                await self.node_service.decompose_using_agent(child.id, self.tree.id)
        
        self.root_node = await self.repos.nodes.get_node_with_children(self.root_node.id)

    async def verify_tree(self):
        researcher = Researcher(
            company=self.company, 
            tree=self.tree, 
            task=self.task, 
            root_node=self.root_node, 
            llm_config=self.core_engine.llm_config
        )

        options = ResearchOption(from_files=True, from_online=False)

        files_update_command, online_update_command = await researcher.run(options)

        if files_update_command:
            await self.run_tree_builder_agent(files_update_command)
        
        if online_update_command:
            await self.run_tree_builder_agent(online_update_command)