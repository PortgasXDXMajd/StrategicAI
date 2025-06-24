from typing import List
from app.helpers.config_helper import Core
from app.models.db_models.task import Task
from app.models.db_models.company import Company
from app.repositories.unit_of_work import UnitOfWork
from app.models.dtos.task.create_task_dto import CreateTaskDto
from app.models.dtos.task.get_task_remmendation_dto import GetTaskRecommendationDto
from app.core.language_models.return_types.task.task_creation import TaskCreationRT
from app.core.language_models.prompts.task.task_creation_prompts import TaskCreationPrompts
from app.core.language_models.return_types.task.task_recommendation import TaskRecommendationListRT
from app.core.language_models.prompts.task.task_recommendation_prompts import TaskRecommendationPrompts


class TaskService:
    def __init__(self, llm_config=None):
        self.repos = UnitOfWork()
        self.core_engine = Core(llm_config)

    async def get(self, id: str) -> Task:
        task = await self.repos.tasks.get_by_id(id)
        if not task:
            raise Exception("Task was not found")

        return task

    async def get_by_company_id(self, company_id: str) -> List[Task]:
        return await self.repos.tasks.get_all(company_id)

    async def get_recommendations(self, get_task_recommendation_dto: GetTaskRecommendationDto, company: Company):
        sys_prmt = TaskRecommendationPrompts.get_system_prompt()
        usr_prmt = TaskRecommendationPrompts.get_prompt_to_recommend_tasks_starting_point(
            get_task_recommendation_dto.description, company.profile)

        recommendations, _ = await self.core_engine.model.generate(sys_prmt, usr_prmt, TaskRecommendationListRT)

        return recommendations

    async def create(self, create_task_dto: CreateTaskDto, company: Company) -> Task:
        sys_prmt = TaskCreationPrompts.get_system_prompt()
        usr_prmt = TaskCreationPrompts.get_prompt_to_create_task(
            create_task_dto, company.profile, create_task_dto.include_company_context)

        created_task_res, _ = await self.core_engine.model.generate(sys_prmt, usr_prmt, TaskCreationRT)

        new_task = Task(
            title=created_task_res.name,
            type=created_task_res.type,
            user_description=created_task_res.user_description,
            company_id=company.id,
            include_company_context=create_task_dto.include_company_context
        )

        await self.repos.tasks.create(new_task)

        return new_task

    async def delete(self, id: str) -> bool:
        trees = await self.repos.trees.get_all_tree(id) # trees and nodes
        for t in trees:
            tree_ana = await self.repos.tree_analyses.get_by_tree_id(t.id)
            if tree_ana:
                await self.repos.tree_analyses.delete(tree_ana.id)
            tree_dec = await self.repos.tree_decisions.get_by_tree_id(t.id)
            if tree_dec:
                await self.repos.tree_decisions.delete(tree_dec.id)
            
            await self.repos.trees.delete(t.id)

        files = await self.repos.files.get_by_task_id(id)
        for f in files:
            await self.repos.files.delete(f.id)

        
        deleted = await self.repos.tasks.delete(id)
        if not deleted:
            raise Exception("There was an error is deleting")

        return deleted
