from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Set, Any, Dict
import asyncio
import json
import math
from app.services.market_data import get_market_overview, get_trending_stocks

router = APIRouter()


def clean_nan_values(obj: Any) -> Any:
    """
    Recursively replace NaN, inf, -inf values with None for JSON compatibility
    """
    if isinstance(obj, dict):
        return {k: clean_nan_values(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nan_values(item) for item in obj]
    elif isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    return obj

# 연결된 WebSocket 클라이언트 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"✅ WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        print(f"❌ WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """모든 연결된 클라이언트에게 메시지 전송"""
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")
                disconnected.add(connection)

        # 연결 끊긴 클라이언트 제거
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()


@router.websocket("/ws/market")
async def market_websocket(websocket: WebSocket):
    """
    실시간 시장 데이터 WebSocket 엔드포인트

    클라이언트가 연결하면 5초마다 최신 시장 데이터를 전송합니다.
    """
    await manager.connect(websocket)

    try:
        # 초기 데이터 즉시 전송
        try:
            overview = await get_market_overview()
            trending = await get_trending_stocks()

            cleaned_data = clean_nan_values({
                "type": "initial",
                "data": {
                    "overview": overview,
                    "trending": trending
                }
            })
            await websocket.send_json(cleaned_data)
        except Exception as e:
            print(f"Error sending initial data: {e}")

        # 클라이언트로부터의 메시지 대기 (연결 유지)
        while True:
            try:
                # 클라이언트 메시지 수신 (ping/pong 등)
                await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"WebSocket error: {e}")
                break

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(websocket)


async def broadcast_market_updates():
    """
    백그라운드 태스크: 5초마다 모든 클라이언트에게 시장 데이터 브로드캐스트
    """
    while True:
        try:
            await asyncio.sleep(5)  # 5초마다 업데이트

            if len(manager.active_connections) > 0:
                # 최신 데이터 가져오기
                overview = await get_market_overview()
                trending = await get_trending_stocks()

                # 모든 클라이언트에게 브로드캐스트
                cleaned_data = clean_nan_values({
                    "type": "update",
                    "data": {
                        "overview": overview,
                        "trending": trending
                    }
                })
                await manager.broadcast(cleaned_data)
                print(f"📊 Broadcast market update to {len(manager.active_connections)} clients")

        except Exception as e:
            print(f"Error in broadcast loop: {e}")
            await asyncio.sleep(5)
