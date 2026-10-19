import os
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.quiz import router as quiz_router
from app.routers.results import router as results_router
from app.services.storage import get_user_results
from app.schemas import UserMeResponse, DashboardResponse
from app.deps import get_current_user
from app.supa import is_configured

app = FastAPI(
    title="Raah — Career Intelligence & Guidance API",
    description="Dynamic field-driven career guidance API powered by Google Gemini and Supabase.",
    version="2.0.0"
)

# CORS Configuration from CORS_ORIGINS (.env comma-separated list)
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
if settings.FRONTEND_URL:
    default_origins.append(settings.FRONTEND_URL)

configured_origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]
origins = list(dict.fromkeys(default_origins + configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(quiz_router)
app.include_router(results_router)
app.include_router(auth_router)

# User and Dashboard Endpoints
@app.get("/api/me", response_model=UserMeResponse, tags=["User"])
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns the authenticated student's profile:
    {id, email, name} where name comes from user.user_metadata name or full_name.
    """
    user_metadata = user.get("user_metadata") or {}
    name = (
        user_metadata.get("name")
        or user_metadata.get("full_name")
        or (user.get("email", "").split("@")[0] if user.get("email") else "Student")
    )
    return UserMeResponse(
        id=str(user.get("id")),
        email=user.get("email"),
        name=name
    )

@app.get("/api/dashboard", response_model=DashboardResponse, tags=["Dashboard"])
async def get_dashboard(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns dashboard analytics for the authenticated student:
    {attempts, latest, top_trait}
    """
    user_id = user.get("id")
    results = get_user_results(user_id)
    attempts = len(results)
    latest = results[0] if results else None
    top_trait = None

    if latest:
        # Profile is saved under scores in descending percentage order
        scores = latest.get("scores") or latest.get("trait_scores") or []
        if isinstance(scores, list) and len(scores) > 0 and isinstance(scores[0], dict):
            top_trait = scores[0].get("trait")

    return DashboardResponse(
        attempts=attempts,
        latest=latest,
        top_trait=top_trait
    )

# Mount static files if directory exists
static_dir = Path(__file__).resolve().parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Raah Career Intelligence API",
        "version": "2.0.0",
        "supabase_connected": is_configured,
        "gemini_configured": bool(settings.GEMINI_API_KEY)
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Raah Career Intelligence API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }
