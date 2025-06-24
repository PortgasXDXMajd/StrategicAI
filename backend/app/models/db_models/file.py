from typing import List, Optional
from app.models.db_models.base_entity import BaseEntity

class File(BaseEntity):
    file_name:str
    company_id: str
    facts: List[str]
    task_id: Optional[str]
    tree_id: Optional[str]
    node_id: Optional[str]