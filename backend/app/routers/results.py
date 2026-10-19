from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.services.storage import (
    get_user_results,
    get_result_by_id_and_user,
    delete_result_by_id_and_user
)
from app.deps import get_current_user

router = APIRouter(prefix="/api/results", tags=["Assessment Results"])

@router.get("", response_model=List[Dict[str, Any]])
async def list_results(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns all past saved assessments for the authenticated student.
    Strictly filtered by the authenticated user's id.
    """
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return get_user_results(user_id)

@router.get("/{id}")
async def get_single_result(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns a single assessment result by its UUID.
    Strictly filtered by the authenticated user's id.
    """
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    result = get_result_by_id_and_user(id, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return {"success": True, "data": result}

@router.delete("/{id}")
async def delete_single_result(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Deletes an assessment result by its UUID.
    Only deletes the caller's own row. Returns 404 if not found or unauthorized.
    """
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    deleted = delete_result_by_id_and_user(id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Result not found")
    return {"success": True, "message": "Result deleted successfully"}
