from fastapi import APIRouter, HTTPException, Query
from app.models import AlertResponse, AlertWithNews
from app.database import get_user_alerts, mark_alert_read
from typing import List

router = APIRouter()

@router.get("/users/{user_id}/alerts", response_model=List[AlertWithNews])
async def get_alerts(user_id: str, limit: int = Query(50, le=100)):
    return await get_user_alerts(user_id, limit)

@router.put("/{alert_id}/read")
async def mark_as_read(alert_id: str):
    success = await mark_alert_read(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert marked as read"}
