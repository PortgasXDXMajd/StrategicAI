from typing import List
from fastapi import Depends, UploadFile
from app.models.db_models.node import Node
from app.helpers.db_helper import DbHelper
from app.helpers.config_helper import Core
from app.models.db_models.tree import TreeType
from app.models.db_models.company import Company
from app.repositories.unit_of_work import UnitOfWork
from app.agents.auto_agent.auto_agent import AutoAgent
from app.helpers.connection_manager_helper import broadcast
from app.models.db_models.tree_analysis import TreeAnalysis
from app.agents.selector.selector_agent import SelectorAgent
from app.core.language_models.prompts.node.needed_models import CandidateNode
from app.agents.collaboration_agent.collaboration_agent import CollaborationAgent
from app.models.dtos.tree_analysis.create_tree_analysis_dto import CreateTreeAnalysisDto

class TreeAnalysisService:
    
    def __init__(self, llm_config=None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)
    
    async def get(self, id: str = Depends()):
        tree_analysis = await self.repos.tree_analyses.get_by_id(id)
        if not tree_analysis:
            raise Exception("Tree Analysis was not found")

        return tree_analysis

    async def get_by_tree_id(self, tree_id: str = Depends()):
        tree_analysis = await self.repos.tree_analyses.get_by_tree_id(tree_id)
        if not tree_analysis:
            raise Exception("Tree Analysis was not found")

        return tree_analysis

    async def get_or_create_collaboration_agent(self, create_tree_analysis_dto: CreateTreeAnalysisDto, company: Company):
        tree, task, tree_analysis, root_node, _ = await DbHelper.get_objects(create_tree_analysis_dto.tree_id)

        if tree_analysis:
            return tree_analysis
        
        await broadcast(tree.id, True, True)

        new_tree_analysis = TreeAnalysis(
            tree_id=create_tree_analysis_dto.tree_id,
            history=[]
        )

        agent = CollaborationAgent(
            company=company,
            tree_analysis=new_tree_analysis,
            tree=tree,
            task=task,
            root_node=root_node,
            llm_config=self.core_engine.llm_config)

        new_tree_analysis = await agent.init_agent()

        await self.repos.tree_analyses.create(new_tree_analysis)

        await broadcast(tree.id, False, True)
        await broadcast(tree.id, "stop", True)

        return new_tree_analysis
        

    async def handle_user_input(self, tree_id: str, company: Company, text: str = None, files: List[UploadFile] = None):
        tree, task, tree_analysis, root_node, _ = await DbHelper.get_objects(tree_id)

        if not tree_analysis:
            return self.get_or_create_collaboration_agent(CreateTreeAnalysisDto(tree_id=tree_id), company)

        await broadcast(tree_analysis.id, "Thinking...", True)

        agent = CollaborationAgent(
            company=company,
            tree_analysis=tree_analysis,
            tree=tree,
            task=task,
            root_node=root_node,
            llm_config=self.core_engine.llm_config)

        payload = await agent.handle_user_input(text, files)

        await broadcast(tree_analysis.id, "", True)
        await broadcast(tree.id, False, True)
        await broadcast(tree.id, "stop", True)

        return payload

    async def create_auto_agent(self, tree_id: str, company: Company, files: List[UploadFile] = []):
        tree, task, tree_analysis, root_node, _ = await DbHelper.get_objects(tree_id)

        await broadcast(tree_id, True, True)
        await broadcast(tree_id, "Auto Agent running...", True)

        agent = AutoAgent(
            company=company,
            tree=tree,
            task=task,
            root_node=root_node,
            llm_config=self.core_engine.llm_config
        )

        await agent.run(files)

        await broadcast(tree_id, "stop all", True)

    async def get_potential_candidates(self, tree_id: str, company: Company):
        tree, task, tree_analysis, root_node, _ = await DbHelper.get_objects(tree_id)

        await broadcast(tree_id, True, True)

        if tree.type == TreeType.WHY:
            await broadcast(tree_id, "Getting Potential Root Cuase Candidates", True)
        elif tree.type == TreeType.HOW:
            await broadcast(tree_id, "Getting Potential Solution Candidates", True)
        else:
            raise Exception("Hypothesis Trees has no potential candidates")
        
        selector_agent = SelectorAgent(
            company=company,
            tree_analysis=tree_analysis,
            tree=tree,
            task=task,
            root_node=root_node,
            llm_config=self.core_engine.llm_config
        )

        ids = await selector_agent.run()

        candidates_nodes: List[Node] = []
        for node_id in ids:
            candidates_nodes.append(await self.repos.nodes.get_by_id(node_id))

        await broadcast(tree_id, "stop all", True)
        candidates_nodes = sorted(candidates_nodes, key=lambda x: x.certainty, reverse=True)

        candidates = list(map(CandidateNode, candidates_nodes))
        
        return candidates
