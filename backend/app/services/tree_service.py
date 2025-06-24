from typing import List
from fastapi import Depends
from app.helpers.config_helper import Core
from app.helpers.llm_helper import LLMHelper
from app.helpers.object_helper import ObjHelper
from app.models.db_models.company import Company
from app.models.db_models.tree import Tree, TreeType
from app.models.db_models.node import Node, NodeType
from app.repositories.unit_of_work import UnitOfWork
from app.models.dtos.tree.create_tree_dto import CreateTreeDto
from app.core.language_models.return_types.analysis.tree_analysis_rt import Decision
from app.core.language_models.return_types.tree.tree_creation_rt import TreeCreationRT
from app.core.language_models.prompts.tree.how_tree_creation_prompts import HowTreeCreationPrompts
from app.core.language_models.prompts.tree.why_tree_creation_prompts import WhyTreeCreationPrompts
from app.core.language_models.prompts.tree.hypothesis_tree_creation_prompts import HypothesisTreeCreationPrompts
from app.core.language_models.return_types.tree.hypotheis_tree_creation_rt import HypothesisNodeRT, create_nodes_recursively


class TreeService:
    def __init__(self, llm_config=None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)

    async def get_all(self, related_node_id: str = None, type: TreeType = None):
        tree = await self.repos.trees.get(related_node_id, type)
        if not tree:
            raise Exception("Tree was not found")
        return tree

    async def get_by_id(self, id: str):
        tree = await self.repos.trees.get_by_id(id)
        if not tree:
            raise Exception("Tree was not found")
        return tree

    async def get_all_by_task_id(self, task_id: str):
        return await self.repos.trees.get_all_tree(task_id)

    async def get_root_node(self, id: str):
        tree = await self.repos.trees.get_by_id(id)
        if not tree:
            raise Exception("Tree was not found")

        root_node = await self.repos.nodes.get_node_with_children(tree.root_node_id)
        return root_node

    async def delete_by_id(self, id: str = Depends()):
        tree_analysis = await self.repos.tree_analyses.get_by_tree_id(id)
        if tree_analysis:
            await self.repos.tree_analyses.delete(tree_analysis.id)

        tree_decision = await self.repos.tree_decisions.get_by_tree_id(id)
        if tree_decision:
            await self.repos.tree_decisions.delete(tree_decision.id)

        deleted = await self.repos.trees.delete(id)
        if not deleted:
            raise Exception("There was an error is deleting")
        return deleted

    async def create_tree(self, create_tree_dto: CreateTreeDto, company: Company) -> List[Tree]:
        created_trees = []

        task = await self.repos.tasks.get_by_id(create_tree_dto.task_id)
        if not task:
            raise Exception("Task was not found")

        tree_context = f"Task Description: {task.user_description}\n"

        if task.include_company_context:
            tree_context += (f"Company Profile: {company.profile.get_company_context()}\n")

        if create_tree_dto.type == TreeType.WHY:
            sys_prmt, usr_prmt = WhyTreeCreationPrompts.get(tree_context)

            created_tree_res, _ = await self.core_engine.model.generate(sys_prmt, usr_prmt, TreeCreationRT)

            new_tree = Tree(
                title=created_tree_res.tree_title,
                type=create_tree_dto.type,
                task_id=task.id,
                payload=tree_context
            )

            new_root_node = Node(
                text=created_tree_res.root_node_text,
                tree_id=new_tree.id,
                parent_id=None,
                type=NodeType.ROOT,
                explanation='Root Node',
                certainty=100
            )

            new_tree.root_node_id = new_root_node.id

            await self.repos.trees.create(new_tree)
            await self.repos.nodes.create(new_root_node)

            created_trees.append(new_tree)

        elif create_tree_dto.type == TreeType.HOW:
            trees_contexts = []
            is_cause_realted = False
            # create How Trees either based on the why node or the why decision
            if create_tree_dto.node_id:
                # creating one how tree for a why node
                related_node = await self.repos.nodes.get_by_id(create_tree_dto.node_id)
                tree_context += (
                    f"Root Problem: {related_node.text}"
                    f" - Explanation: {related_node.explanation}\n")

                trees_contexts.append((related_node.id, tree_context))
                is_cause_realted = True

            else:
                # we will create how tree(s) for the decision of the why tree
                why_trees = await self.repos.trees.get_tree_by_task_id_tree_type(task.id, TreeType.WHY)
                if why_trees:
                    why_tree_decision = await self.repos.tree_decisions.get_by_tree_id(why_trees[0].id)
                    if why_tree_decision:
                        if why_tree_decision.payload:
                            why_decision = ObjHelper.cast(
                                why_tree_decision.payload, Decision)
                            for rc in why_decision.items:
                                rc_node = await self.repos.nodes.get_by_id(rc.node_id)
                                if rc_node:
                                    rc_context = tree_context + (
                                        f"Root Problem: {rc_node.text}"
                                        f" - Explanation: {rc_node.explanation}\n\n")

                                    trees_contexts.append(
                                        (rc_node.id, rc_context))
                                    is_cause_realted = True

            if not trees_contexts:
                # In this case it means we are creating a how tree from the task directly
                trees_contexts.append((None, tree_context))

            for node_id, tc in trees_contexts:
                why_node = None
                if node_id:
                    why_node = await self.repos.nodes.get_by_id(node_id)
                    # pre-exisiting how tree
                    how_tree = await self.repos.trees.get_by_id(why_node.related_tree_id)
                    if how_tree:
                        created_trees.append(how_tree)
                        continue

                sys_prmt, usr_prmt = HowTreeCreationPrompts.get(
                    tc, is_cause_realted)
                created_tree_res, _ = await self.core_engine.model.generate(sys_prmt, usr_prmt, TreeCreationRT)

                new_tree = Tree(
                    title=created_tree_res.tree_title,
                    type=create_tree_dto.type,
                    task_id=task.id,
                    payload=tc,
                    related_node_id=node_id
                )

                new_root_node = Node(
                    text=created_tree_res.root_node_text,
                    tree_id=new_tree.id,
                    parent_id=None,
                    type=NodeType.ROOT,
                    explanation='Root Node',
                    certainty=100
                )

                if why_node:
                    why_node.is_related_to_diff_tree = True
                    why_node.related_tree_id = new_tree.id
                    await self.repos.nodes.update(why_node.id, why_node)

                new_tree.root_node_id = new_root_node.id

                await self.repos.trees.create(new_tree)
                await self.repos.nodes.create(new_root_node)
                created_trees.append(new_tree)

        elif create_tree_dto.type == TreeType.HYPOTHESIS:
            new_tree = await self._create_hypothesis_tree(tree_context, create_tree_dto.node_id, task.id)
            created_trees.append(new_tree)

        return created_trees

    def build_tree_hierarchy(self, nodes: List[Node]):
        node_map = {}
        for node in nodes:
            node_map[node.id] = {
                "id": node.id,
                "text": node.text,
                "required_data": node.required_data,
                "children": []
            }
        
        hierarchy = []
        for node in nodes:
            if node.parent_id is None:
                hierarchy.append(node_map[node.id])
            else:
                parent = node_map.get(node.parent_id)
                if parent:
                    parent["children"].append(node_map[node.id])
        return hierarchy

    async def _create_hypothesis_tree(self, tree_context: str, node_id: str = None, task_id: str = None):
        is_solution_related = False
        is_problem_related = False
        how_related_node = None
        
        if node_id:
            # creating one hypothesis tree for a how node

            how_related_node = await self.repos.nodes.get_by_id(node_id)
            how_tree = await self.repos.trees.get_by_id(how_related_node.tree_id)

            # override the tree context from the how tree context (it includes the root cause if avialable)
            tree_context = how_tree.payload
            tree_context += (
                f"Proposed solution to be tested: {how_related_node.text}"
                f" - Explanation: {how_related_node.explanation}\n")

            is_solution_related = True
            is_problem_related = True if how_tree.related_node_id else False

            if how_related_node.is_related_to_diff_tree and how_related_node.related_tree_id:
                # pre-exisiting hypo tree
                hypo_tree = await self.repos.trees.get_by_id(how_related_node.related_tree_id)
                if hypo_tree:
                    return hypo_tree
                else:
                    how_related_node.is_related_to_diff_tree = False
                    how_related_node.related_tree_id = None
                    await self.repos.nodes.update(how_related_node.id, how_related_node)

        system_prompt = HypothesisTreeCreationPrompts.system_prompt()
        user_prompt = HypothesisTreeCreationPrompts.user_prompt(tree_context, is_solution_related, is_problem_related)

        created_root_node, _ = await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            usr_prmt=user_prompt,
            sys_prmt=system_prompt,
            is_history_required=False
        )

        new_tree = Tree(
            title=created_root_node['title'],
            type=TreeType.HYPOTHESIS,
            task_id=task_id,
            payload=tree_context,
            related_node_id=how_related_node.id if how_related_node else None
        )

        system_prompt, user_prompt = HypothesisTreeCreationPrompts.get(created_root_node['root_node'], tree_context, is_solution_related, is_problem_related)
        
        created_hypo_tree, _ = await LLMHelper.safe_generate_response(
            core_engine=self.core_engine,
            usr_prmt=user_prompt,
            sys_prmt=system_prompt,
            is_history_required=False
        )

        root_node = HypothesisNodeRT(
            question=created_root_node['root_node'],
            required_data=created_root_node['required_data'],
            children=created_hypo_tree['branches']
        )
        
        nodes_to_be_added_to_db = create_nodes_recursively(root_node, tree_id=new_tree.id, )
        new_tree.root_node_id = nodes_to_be_added_to_db[0].id
        
        if how_related_node:
            how_related_node.is_related_to_diff_tree = True
            how_related_node.related_tree_id = new_tree.id
            await self.repos.nodes.update(how_related_node.id, how_related_node)

        new_tree.related_node_id = how_related_node.id if how_related_node else None

        await self.repos.trees.create(new_tree)
        await self.repos.nodes.create(nodes_to_be_added_to_db)

        return new_tree
