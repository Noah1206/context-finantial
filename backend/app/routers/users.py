from fastapi import APIRouter, HTTPException
from app.models import UserResponse, UserUpdate, UserStockCreate, UserStockResponse
from app.database import get_user_by_id, update_user, add_to_watchlist, get_watchlist, remove_from_watchlist
from typing import List

router = APIRouter()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, data: UserUpdate):
    user = await update_user(user_id, data.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

@router.get("/{user_id}/stocks", response_model=List[dict])
async def get_user_watchlist(user_id: str):
    return await get_watchlist(user_id)

@router.post("/{user_id}/stocks")
async def add_stock_to_watchlist(user_id: str, stock_data: UserStockCreate):
    result = await add_to_watchlist(user_id, stock_data.ticker, stock_data.alert_threshold)
    if not result:
        raise HTTPException(status_code=400, detail="Failed to add stock")
    return result

@router.delete("/{user_id}/stocks/{stock_id}")
async def remove_stock_from_watchlist(user_id: str, stock_id: str):
    success = await remove_from_watchlist(user_id, stock_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stock not found in watchlist")
    return {"message": "Stock removed from watchlist"}
