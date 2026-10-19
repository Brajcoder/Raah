import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.supa import admin, client, is_configured

logger = logging.getLogger(__name__)

# In-memory storage caches for local testing and fallback sessions
_IN_MEMORY_QUIZZES: Dict[str, Dict[str, Any]] = {}
_IN_MEMORY_RESULTS: List[Dict[str, Any]] = []

# Expose aliases for unit testing fixtures
in_memory_quizzes = _IN_MEMORY_QUIZZES
in_memory_results = _IN_MEMORY_RESULTS

def get_db():
    """Returns the administrative Supabase client if available, else anon client."""
    return admin() or client

# ==================== QUIZ STORAGE ====================

def save_quiz(user_id: str, field: str, questions: List[Dict[str, Any]]) -> str:
    """
    Saves a generated quiz record with its questions into the quizzes table.
    Filters/associates by user_id. Returns the quiz UUID.
    """
    quiz_id = str(uuid.uuid4())
    record = {
        "id": quiz_id,
        "user_id": user_id,
        "field": field,
        "questions": questions,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    db = get_db()
    if is_configured and db:
        try:
            res = db.table("quizzes").insert(record).execute()
            if res.data and len(res.data) > 0:
                _IN_MEMORY_QUIZZES[quiz_id] = record
                return res.data[0]["id"]
        except Exception as e:
            logger.error(f"Supabase save_quiz error (using in-memory): {e}")

    _IN_MEMORY_QUIZZES[quiz_id] = record
    return quiz_id

def get_quiz_by_id_and_user(quiz_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a quiz by id AND filters strictly by user_id for security.
    Returns None if not found or owned by a different user.
    """
    db = get_db()
    if is_configured and db:
        try:
            res = db.table("quizzes").select("*").eq("id", quiz_id).eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_quiz error: {e}")

    quiz = _IN_MEMORY_QUIZZES.get(quiz_id)
    if quiz and quiz.get("user_id") == user_id:
        return quiz
    return None

# ==================== RESULTS STORAGE ====================

def save_result(
    user_id: str,
    field: Optional[str] = None,
    quiz_id: Optional[str] = None,
    scores: Optional[List[Dict[str, Any]]] = None,
    matches: Optional[List[Dict[str, Any]]] = None,
    ai: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Saves assessment result into 'results' table.
    If database persistence fails, logs error, stores in-memory, and returns record.
    """
    result_id = str(uuid.uuid4())
    record = {
        "id": result_id,
        "user_id": user_id,
        "field": field,
        "quiz_id": quiz_id,
        "scores": scores,
        "matches": matches,
        "ai": ai,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    db = get_db()
    if is_configured and db:
        try:
            res = db.table("results").insert(record).execute()
            if res.data and len(res.data) > 0:
                _IN_MEMORY_RESULTS.insert(0, res.data[0])
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase save_result error (falling back to memory): {e}")

    _IN_MEMORY_RESULTS.insert(0, record)
    return record

def get_user_results(user_id: str) -> List[Dict[str, Any]]:
    """
    Retrieves all past assessment results for a specific student, filtering by user_id.
    """
    db = get_db()
    if is_configured and db:
        try:
            res = db.table("results").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            logger.error(f"Supabase get_user_results error: {e}")

    return [r for r in _IN_MEMORY_RESULTS if r.get("user_id") == user_id]

def get_result_by_id_and_user(result_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single assessment result by ID, filtering strictly by user_id.
    """
    db = get_db()
    if is_configured and db:
        try:
            res = db.table("results").select("*").eq("id", result_id).eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            logger.error(f"Supabase get_result_by_id_and_user error: {e}")

    for r in _IN_MEMORY_RESULTS:
        if r.get("id") == result_id and r.get("user_id") == user_id:
            return r
    return None

def delete_result_by_id_and_user(result_id: str, user_id: str) -> bool:
    """
    Deletes an assessment result only if owned by the caller (user_id).
    Returns True if successfully deleted, False otherwise.
    """
    db = get_db()
    deleted = False

    if is_configured and db:
        try:
            res = db.table("results").delete().eq("id", result_id).eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                deleted = True
        except Exception as e:
            logger.error(f"Supabase delete_result error: {e}")

    # Also clean up in-memory list
    global _IN_MEMORY_RESULTS
    initial_len = len(_IN_MEMORY_RESULTS)
    _IN_MEMORY_RESULTS = [
        r for r in _IN_MEMORY_RESULTS
        if not (r.get("id") == result_id and r.get("user_id") == user_id)
    ]
    if len(_IN_MEMORY_RESULTS) < initial_len:
        deleted = True

    return deleted
