from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication (Deprecated)"])

@router.post("/signup")
async def signup():
    """
    Disabled: Signup is now handled directly by the frontend using Supabase JS (email OTP and Google).
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Signup endpoint is disabled. The frontend handles authentication directly via Supabase JS."
    )

@router.post("/login")
async def login():
    """
    Disabled: Login is now handled directly by the frontend using Supabase JS (email OTP and Google).
    """
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Login endpoint is disabled. The frontend handles authentication directly via Supabase JS."
    )
