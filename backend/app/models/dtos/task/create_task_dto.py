from typing import Optional
from app.models.dtos.configs.llm_type_enum import DtoConfigs
from app.models.db_models.task import TaskType


class CreateTaskDto(DtoConfigs):
    description: str
    type: TaskType
    include_company_context: Optional[bool] = True

    def get_task_as_prompt(self):
        return f"""
        Task Description: {self.description}
        Task Type: {self.type}
        """
