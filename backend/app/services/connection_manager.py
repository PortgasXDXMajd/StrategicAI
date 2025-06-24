from threading import Lock
from fastapi import WebSocket
from datetime import datetime
from typing import Any, Dict, Optional, Set

class ConnectionManager:
    _instance = None
    _lock = Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ConnectionManager, cls).__new__(cls)
                cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self._active_connections: Dict[str, Set[WebSocket]] = {}
        self._connection_metadata: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, object_id: str) -> None:
        try:
            await websocket.accept()
            if object_id not in self._active_connections:
                self._active_connections[object_id] = set()
            self._active_connections[object_id].add(websocket)
            self._connection_metadata[websocket] = {
                "object_id": object_id,
                "connected_at": datetime.now(),
                "last_activity": datetime.now()
            }
        except Exception as e:
            raise e

    async def disconnect(self, websocket: WebSocket) -> None:
        try:
            metadata = self._connection_metadata.get(websocket)
            if metadata:
                object_id = metadata["object_id"]
                if object_id in self._active_connections:
                    self._active_connections[object_id].remove(websocket)
                    if not self._active_connections[object_id]:
                        del self._active_connections[object_id]
                del self._connection_metadata[websocket]
        except Exception as e:
            raise e

    async def shutdown(self) -> None:
        all_connections = [
            websocket for connections in self._active_connections.values() for websocket in connections
        ]
        for websocket in all_connections:
            await websocket.close()
        self._active_connections.clear()
        self._connection_metadata.clear()
    
    async def broadcast_to_object(self, object_id: str, data: Any) -> None:
        if object_id not in self._active_connections:
            return

        disconnected = set()
        for websocket in self._active_connections[object_id]:
            try:
                await websocket.send_json(data)
                self._connection_metadata[websocket]["last_activity"] = datetime.utcnow()
            except Exception as e:
                disconnected.add(websocket)

        for websocket in disconnected:
            await self.disconnect(websocket)

    def get_connections_count(self, object_id: Optional[str] = None) -> int:
        if object_id:
            return len(self._active_connections.get(object_id, set()))
        return sum(len(connections) for connections in self._active_connections.values())
