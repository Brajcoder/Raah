import uuid
import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends

from app.schemas import (
    QuizStartRequest,
    QuizStartResponse,
    QuizQuestionClient,
    QuizSubmitRequest,
    QuizSubmitResponse,
    TraitScoreItem,
)
from app.services.llm import clean_field, generate_quiz, recommend_for_field
from app.services.rate_limiter import check_rate_limit
from app.services.storage import save_quiz, get_quiz_by_id_and_user, save_result
from app.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])

@router.post("/start", response_model=QuizStartResponse)
async def start_quiz(
    payload: QuizStartRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Starts a new dynamic field-based quiz:
    - Auth required
    - Per-user LLM rate limit
    - Cleans field text and validates real course/discipline
    - Calls Gemini to generate 10-question quiz
    - Stores quiz in Supabase quizzes table
    - Returns quiz with trait tags strictly omitted for client security
    """
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Rate limiting for LLM call
    if not check_rate_limit(user_id):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a moment before requesting another quiz."
        )

    # Sanitize field input
    cleaned_field = clean_field(payload.field)
    if not cleaned_field:
        raise HTTPException(
            status_code=422,
            detail="Please enter a valid course or field"
        )

    # Generate quiz using Gemini
    result = generate_quiz(cleaned_field)

    if result is None:
        raise HTTPException(
            status_code=502,
            detail="Quiz generation failed. Please try again."
        )

    if isinstance(result, dict) and "error" in result:
        raise HTTPException(
            status_code=422,
            detail=result["error"]
        )

    questions = result.get("questions", [])
    if len(questions) != 10:
        raise HTTPException(
            status_code=502,
            detail="Invalid quiz structure received from generator."
        )

    # Store in database
    quiz_id = save_quiz(user_id=user_id, field=cleaned_field, questions=questions)

    # Transform questions for client - NEVER send trait tags to client
    client_questions: List[QuizQuestionClient] = []
    for q_item in questions:
        client_questions.append(
            QuizQuestionClient(
                q=q_item.get("q", ""),
                options=[opt.get("text", "") for opt in q_item.get("options", [])]
            )
        )

    return QuizStartResponse(
        quiz_id=quiz_id,
        field=cleaned_field,
        questions=client_questions
    )

@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_quiz(
    payload: QuizSubmitRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Submits student responses for a dynamic field quiz:
    - Auth required
    - Validates answers (exactly 10 integers, each 0-3)
    - Loads quiz by id AND user_id (404 otherwise)
    - Maps answers to traits on server side
    - Computes profile = [{trait, score}] where score = count/10*100 sorted descending
    - Rate limit check + LLM call to recommend_for_field
    - Saves result to Supabase results table (scores=profile, matches=[], ai, field, quiz_id)
    - Returns {id, field, profile, ai}
    """
    user_id = user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Validate answers format
    if not isinstance(payload.answers, list) or len(payload.answers) != 10:
        raise HTTPException(
            status_code=422,
            detail="Answers must contain exactly 10 integers."
        )

    for idx, ans in enumerate(payload.answers):
        if not isinstance(ans, int) or ans < 0 or ans > 3:
            raise HTTPException(
                status_code=422,
                detail=f"Answer at index {idx} must be an integer between 0 and 3."
            )

    # Load quiz by id AND user_id
    quiz = get_quiz_by_id_and_user(payload.quiz_id, user_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    stored_questions = quiz.get("questions") or []
    if len(stored_questions) != 10:
        raise HTTPException(status_code=500, detail="Stored quiz questions corrupted")

    # Map answers to traits
    trait_counts: Dict[str, int] = {"A": 0, "C": 0, "S": 0, "L": 0, "B": 0, "O": 0}
    qa_list: List[Dict[str, Any]] = []

    for idx, ans_idx in enumerate(payload.answers):
        q_obj = stored_questions[idx]
        options = q_obj.get("options") or []
        if ans_idx >= len(options):
            raise HTTPException(
                status_code=422,
                detail=f"Answer index {ans_idx} out of range for question {idx + 1}"
            )
        opt_chosen = options[ans_idx]
        trait = opt_chosen.get("trait")
        if trait in trait_counts:
            trait_counts[trait] += 1
        qa_list.append({
            "q": q_obj.get("q"),
            "answer": opt_chosen.get("text"),
            "trait": trait
        })

    # Compute trait profile (percentage sorted descending)
    profile: List[Dict[str, Any]] = [
        {"trait": t, "score": round((count / 10.0) * 100.0, 1)}
        for t, count in trait_counts.items()
    ]
    profile.sort(key=lambda x: x["score"], reverse=True)

    # LLM rate limit for recommendation
    if not check_rate_limit(user_id):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a moment before submitting."
        )

    field = quiz.get("field", "")
    ai_guidance = recommend_for_field(field=field, profile=profile, qa=qa_list)

    # Save to results table
    result_id = str(uuid.uuid4())
    try:
        saved = save_result(
            user_id=user_id,
            field=field,
            quiz_id=payload.quiz_id,
            scores=profile,
            matches=[],
            ai=ai_guidance
        )
        if saved and "id" in saved:
            result_id = str(saved["id"])
    except Exception as e:
        logger.error(f"Failed to persist quiz result in Supabase: {e}")

    return QuizSubmitResponse(
        id=result_id,
        field=field,
        profile=[TraitScoreItem(**item) for item in profile],
        ai=ai_guidance
    )
