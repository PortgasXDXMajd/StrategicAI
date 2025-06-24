from fastapi import HTTPException
from app.helpers.config_helper import Core
from app.models.db_models.tree import TreeType
from app.helpers.object_helper import ObjHelper
from app.repositories.unit_of_work import UnitOfWork
from app.models.db_models.node_result import NodeAnswer
from app.models.db_models.tree_decision import TreeDecision
from app.helpers.connection_manager_helper import broadcast
from app.agents.solution_writer_agent.solution_writer_agent import SolutionWriterAgent
from app.core.language_models.return_types.analysis.tree_analysis_rt import Decision, DecisionItem

class TreeDecisionService:
    def __init__(self):
        self.repos = UnitOfWork()
        self.core_engine = Core()

    async def get(self, id: str):
        tree_decision = await self.repos.tree_decisions.get_by_id(id)
        if not tree_decision:
            raise HTTPException(status_code=404, detail="Tree Decision was not found")
        
        return tree_decision
    
    async def get_by_tree_id(self, tree_id: str):
        tree_decision = await self.repos.tree_decisions.get_by_tree_id(tree_id)
        if not tree_decision:
            raise HTTPException(status_code=404, detail="Tree Decision was not found")
        
        return tree_decision
    
    async def delete_by_tree_id(self, tree_id: str):
        
        tree_decision = await self.repos.tree_decisions.get_by_tree_id(tree_id)

        if not tree_decision:
            return True

        decision = ObjHelper.cast(tree_decision.payload, Decision)
        if decision:
            node_ids = [item.node_id for item in decision.items]
            nodes = await self.repos.nodes.get_by_ids(node_ids)

            for node in nodes:
                if node:
                    node.is_part_decision = False
                    await self.repos.nodes.update(node.id, node)

        await self.repos.tree_decisions.delete(tree_decision.id)

        return True
    
    async def remove_node_from_decision(self, node_id:str):
        to_delete_decision = False

        node = await self.repos.nodes.get_by_id(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node was not found")
        
        node.is_part_decision = False
        await self.repos.nodes.update(node.id, node)

        tree = await self.repos.trees.get_by_id(node.tree_id)
        if not tree:
            raise HTTPException(status_code=404, detail="Tree was not found")
        
        tree_decision = await self.repos.tree_decisions.get_by_tree_id(tree.id)
        if not tree_decision:
            return
        
        decision = ObjHelper.cast(tree_decision.payload, Decision)

        if decision:
            existing_item = next((rc for rc in decision.items if rc.node_id == node.id), None)

            if existing_item:
                decision.items = [rc for rc in decision.items if rc.node_id != node.id]
                to_delete_decision = len(decision.items) == 0

        if to_delete_decision:
            await self.repos.tree_decisions.delete(tree_decision.id)
        else:
            await self.repos.tree_decisions.update(tree_decision.id, tree_decision, upsert=True)

    async def update_node_in_decision(self, node_id:str):
        node = await self.repos.nodes.get_by_id(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node was not found")
        
        tree = await self.repos.trees.get_by_id(node.tree_id)
        if not tree:
            raise HTTPException(status_code=404, detail="Tree was not found")
        
        tree_decision = await self.repos.tree_decisions.get_by_tree_id(tree.id)
        if not tree_decision:
            return
        
        decision = ObjHelper.cast(tree_decision.payload, Decision)
        if decision:
            existing_item= next((rc for rc in decision.items if rc.node_id == node.id), None)
            if existing_item:
                decision.items = [rc for rc in decision.items if rc.node_id != node.id]
                decision.items.append(
                    DecisionItem(
                        node_id=node.id,
                        item=node.text,
                        explanation=node.explanation,
                        certainty=node.certainty
                    )
                )
        
        await self.repos.tree_decisions.update(tree_decision.id, tree_decision, upsert=True)
            
    async def toggle_node_as_decision(self, node_id: str, must_add: bool = False):
        to_delete_decision = False
        node = await self.repos.nodes.get_by_id(node_id)
        if not node:
            raise HTTPException(status_code=404, detail="Node was not found")
        
        tree = await self.repos.trees.get_by_id(node.tree_id)
        if not tree:
            raise HTTPException(status_code=404, detail="Tree was not found")
        
        tree_decision = await self.repos.tree_decisions.get_by_tree_id(tree.id)

        if not tree_decision:
            tree_decision = TreeDecision(tree_id=tree.id, payload=None)

        node.is_part_decision = True

        decision = ObjHelper.cast(tree_decision.payload, Decision)
        
        description = node.explanation

        if decision:
            existing_items = next((rc for rc in decision.items if rc.node_id == node.id), None)

            if existing_items:
                if must_add:
                    decision.items = [rc for rc in decision.items if rc.node_id != node.id]
                    
                    if tree.type == TreeType.HOW:
                        writer = SolutionWriterAgent(tree,self.core_engine.llm_config)
                        description = await writer.run(node)
                    
                    decision.items.append(
                        DecisionItem(
                            node_id=node.id,
                            item=node.text,
                            explanation=description,
                            certainty=node.certainty
                        )
                    )
                else:
                    decision.items = [rc for rc in decision.items if rc.node_id != node.id]
                    to_delete_decision = len(decision.items) == 0
                    node.is_part_decision = False
            else:
                if tree.type == TreeType.HOW:
                    writer = SolutionWriterAgent(tree,self.core_engine.llm_config)
                    description = await writer.run(node)
                decision.items.append(
                    DecisionItem(
                        node_id=node.id,
                        item=node.text,
                        explanation=description,
                        certainty=node.certainty
                    )
                )
        else:
            if tree.type == TreeType.HOW:
                writer = SolutionWriterAgent(tree,self.core_engine.llm_config)
                description = await writer.run(node)
                
            decision = Decision(
                items=[
                    DecisionItem(
                        node_id=node.id,
                        item=node.text,
                        explanation=description,
                        certainty=node.certainty
                    )
                ]
            )

        tree_decision.payload = decision

        if to_delete_decision:
            await self.repos.tree_decisions.delete(tree_decision.id)
        else:
            await self.repos.tree_decisions.update(tree_decision.id, tree_decision, upsert=True)

        await self.repos.nodes.update(node.id, node)

        return tree_decision

    async def upsert(self, tree_id: str, payload: Decision | NodeAnswer | None):

        tree_decision = await self.repos.tree_decisions.get_by_tree_id(tree_id)
        
        if tree_decision:
            tree_decision.payload = payload
        else:
            tree_decision = TreeDecision(tree_id=tree_id, payload=payload)
        
        tree = await self.repos.trees.get_by_id(tree_id)
        
        if tree.type == TreeType.HYPOTHESIS:
            root_node = await self.repos.nodes.get_node_with_children(tree.root_node_id)
            root_node.certainty = payload.certainty
            root_node.explanation = payload.answer

            await self.repos.nodes.update(root_node.id, root_node)

            if not payload.question:
                payload.question = root_node.text

            _, related_node = await self.repos.trees.find_related_how_tree(tree_id)
            if related_node:
                if "true" in payload.answer.lower():
                    await self.toggle_node_as_decision(related_node.id, must_add=True)
            
            await broadcast(tree.id, root_node)

        await self.repos.tree_decisions.update(tree_decision.id, tree_decision, upsert=True)

        return tree_decision