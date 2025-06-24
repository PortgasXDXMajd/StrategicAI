from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.helpers.connection_manager_helper import websocket_connection

router = APIRouter(prefix="/ws")

@router.websocket("/{object_id}")
async def websocket_endpoint(websocket: WebSocket, object_id: str):
    async with websocket_connection(websocket, object_id):
        try:
            while True:
                data = await websocket.receive_json()
        except WebSocketDisconnect as disconnect:
            print(f"WebSocket disconnected: {disconnect.code}")
        except Exception as e:
            print(f"Unexpected error: {e}")