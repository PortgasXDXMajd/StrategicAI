from pydantic import BaseModel

class LLMConfigDto(BaseModel):
    type: str = "openai"
    model: str = "gpt-4o-mini"

class DtoConfigs(BaseModel):
    pass
