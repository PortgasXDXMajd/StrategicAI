from enum import Enum
from typing import Any, Dict
from datetime import datetime
from fastapi import WebSocket
from app.models.db_models.node import Node
from fastapi.encoders import jsonable_encoder
from fastapi.concurrency import asynccontextmanager
from app.services.connection_manager import ConnectionManager

manager = ConnectionManager()

FRONTEND_TREE_SELECTION_CHANNEL = '7cfd29b7-ed40-413d-aceb-8c88d3254681'


@asynccontextmanager
async def websocket_connection(websocket: WebSocket, obj_id: str):
    try:
        await manager.connect(websocket, obj_id)
        yield
    finally:
        await manager.disconnect(websocket)


def serialize_node(node) -> Dict[str, Any]:
    node_dict = {
        "id": node.id,
        "created_at": node.created_at.isoformat() if isinstance(node.created_at, datetime) else node.created_at,
        "modified_at": node.modified_at.isoformat() if isinstance(node.modified_at, datetime) else node.modified_at,
        "tree_id": node.tree_id,
        "text": node.text,
        "type": node.type.value if isinstance(node.type, Enum) else node.type,
        "explanation": node.explanation,
        "certainty": node.certainty,
        "parent_id": node.parent_id,
        "is_related_to_diff_tree": node.is_related_to_diff_tree,
        "related_tree_id": node.related_tree_id,
        "required_data": node.required_data,
        "children": [serialize_node(child) for child in node.children] if node.children else []
    }
    return node_dict


async def broadcast(id: str, data: Any, is_notification=False) -> None:
    if isinstance(data, Node):
        data_dict = serialize_node(data)
    else:
        data_dict = data

    message = jsonable_encoder(data_dict)

    if is_notification:
        id = f'{id}-notification'

    await manager.broadcast_to_object(id, message)
