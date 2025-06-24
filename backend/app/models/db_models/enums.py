from enum import Enum

class AnalysisActors(str, Enum):
    SYSTEM = 'system'
    USER = 'user'

class UserChatInputType(str, Enum):
    TEXT = 'text'
    FILE = 'file'