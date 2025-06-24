from app.models.dtos.configs.llm_type_enum import DtoConfigs

class EditNodeDto(DtoConfigs):
    node_id: str
    text: str
    certainty: float
    explanation: str